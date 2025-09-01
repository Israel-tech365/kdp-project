// Comprehensive export utilities for Amazon KDP publishing formats
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { Book } from '@shared/schema';

export interface ExportOptions {
  format: 'kindle' | 'epub' | 'pdf' | 'docx' | 'print-ready';
  includeImages: boolean;
  paperSize?: 'us-trade' | 'us-letter' | 'a4' | 'custom';
  margins?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  fontSize?: number;
  fontFamily?: string;
  lineSpacing?: number;
}

export async function exportBook(book: Book, options: ExportOptions): Promise<void> {
  try {
    switch (options.format) {
      case 'kindle':
        await exportToKindle(book, options);
        break;
      case 'epub':
        await exportToEPUB(book, options);
        break;
      case 'pdf':
        await exportToPDF(book, options);
        break;
      case 'docx':
        await exportToDocx(book, options);
        break;
      case 'print-ready':
        await exportPrintReady(book, options);
        break;
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Export failed: ${errorMessage}`);
  }
}

async function exportToKindle(book: Book, options: ExportOptions): Promise<void> {
  // Create EPUB first, then convert to MOBI/KFX compatible format
  const zip = new JSZip();
  
  // EPUB structure for Kindle compatibility
  zip.file('mimetype', 'application/epub+zip');
  
  // META-INF
  const metaInf = zip.folder('META-INF');
  metaInf!.file('container.xml', createContainerXML());
  
  // OEBPS (content)
  const oebps = zip.folder('OEBPS');
  
  // Content files
  oebps!.file('content.opf', createContentOPF(book, options));
  oebps!.file('toc.ncx', createTOCNCX(book));
  oebps!.file('stylesheet.css', createKindleCSS(options));
  
  // Title page
  oebps!.file('title.xhtml', createTitlePage(book));
  
  // Table of contents
  oebps!.file('toc.xhtml', createTOCPage(book));
  
  // Chapters
  if (book.content && Array.isArray(book.content)) {
    book.content.forEach((chapter, index) => {
      oebps!.file(`chapter${index + 1}.xhtml`, createChapterXHTML(chapter, options));
    });
  }
  
  // Cover image
  if (book.coverUrl && options.includeImages) {
    try {
      const coverResponse = await fetch(book.coverUrl);
      const coverBlob = await coverResponse.blob();
      oebps!.file('cover.jpg', coverBlob);
    } catch (e) {
      console.warn('Could not include cover image:', e);
    }
  }
  
  // Generate and download
  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, `${sanitizeFilename(book.title)}_kindle.epub`);
}

async function exportToEPUB(book: Book, options: ExportOptions): Promise<void> {
  const zip = new JSZip();
  
  // Standard EPUB structure
  zip.file('mimetype', 'application/epub+zip');
  
  const metaInf = zip.folder('META-INF');
  metaInf!.file('container.xml', createContainerXML());
  
  const oebps = zip.folder('OEBPS');
  oebps!.file('content.opf', createContentOPF(book, options));
  oebps!.file('toc.ncx', createTOCNCX(book));
  oebps!.file('stylesheet.css', createEPUBCSS(options));
  oebps!.file('title.xhtml', createTitlePage(book));
  oebps!.file('toc.xhtml', createTOCPage(book));
  
  // Add chapters
  if (book.content && Array.isArray(book.content)) {
    book.content.forEach((chapter, index) => {
      oebps!.file(`chapter${index + 1}.xhtml`, createChapterXHTML(chapter, options));
    });
  }
  
  // Include cover
  if (book.coverUrl && options.includeImages) {
    try {
      const coverResponse = await fetch(book.coverUrl);
      const coverBlob = await coverResponse.blob();
      oebps!.file('cover.jpg', coverBlob);
    } catch (e) {
      console.warn('Could not include cover image:', e);
    }
  }
  
  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, `${sanitizeFilename(book.title)}.epub`);
}

async function exportToPDF(book: Book, options: ExportOptions): Promise<void> {
  // Create HTML content for PDF generation
  const htmlContent = createPDFHTML(book, options);
  
  // Use browser's print functionality to generate PDF
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Trigger print dialog
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  } else {
    // Fallback: create downloadable HTML file
    const blob = new Blob([htmlContent], { type: 'text/html' });
    saveAs(blob, `${sanitizeFilename(book.title)}_print.html`);
  }
}

async function exportToDocx(book: Book, options: ExportOptions): Promise<void> {
  // Create Word-compatible HTML
  const htmlContent = createWordHTML(book, options);
  
  // Save as .docx-compatible HTML
  const blob = new Blob([htmlContent], { 
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
  });
  saveAs(blob, `${sanitizeFilename(book.title)}.docx`);
}

async function exportPrintReady(book: Book, options: ExportOptions): Promise<void> {
  // Create print-ready PDF with proper margins and formatting
  const htmlContent = createPrintReadyHTML(book, options);
  
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  }
}

// Helper functions for creating EPUB/Kindle files

function createContainerXML(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;
}

function createContentOPF(book: Book, options: ExportOptions): string {
  const chapterCount = Array.isArray(book.content) ? book.content.length : 0;
  const chapters = Array.isArray(book.content) ? book.content : [];
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="bookid" version="2.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
    <dc:title>${escapeXML(book.title)}</dc:title>
    <dc:creator opf:role="aut">${escapeXML(book.author)}</dc:creator>
    <dc:subject>${escapeXML(book.genre)}</dc:subject>
    <dc:description>${escapeXML(book.description || '')}</dc:description>
    <dc:language>en</dc:language>
    <dc:identifier id="bookid">${generateUUID()}</dc:identifier>
    <meta name="cover" content="cover-img"/>
  </metadata>
  
  <manifest>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    <item id="stylesheet" href="stylesheet.css" media-type="text/css"/>
    <item id="title" href="title.xhtml" media-type="application/xhtml+xml"/>
    <item id="toc" href="toc.xhtml" media-type="application/xhtml+xml"/>
    ${chapters.map((_, index) => 
      `<item id="chapter${index + 1}" href="chapter${index + 1}.xhtml" media-type="application/xhtml+xml"/>`
    ).join('\n    ')}
    ${options.includeImages && book.coverUrl ? '<item id="cover-img" href="cover.jpg" media-type="image/jpeg"/>' : ''}
  </manifest>
  
  <spine toc="ncx">
    <itemref idref="title"/>
    <itemref idref="toc"/>
    ${chapters.map((_, index) => `<itemref idref="chapter${index + 1}"/>`).join('\n    ')}
  </spine>
  
  ${options.includeImages && book.coverUrl ? '<guide><reference type="cover" title="Cover" href="title.xhtml"/></guide>' : ''}
</package>`;
}

function createTOCNCX(book: Book): string {
  const chapters = Array.isArray(book.content) ? book.content : [];
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="${generateUUID()}"/>
    <meta name="dtb:depth" content="1"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  
  <docTitle>
    <text>${escapeXML(book.title)}</text>
  </docTitle>
  
  <navMap>
    <navPoint id="navpoint-1" playOrder="1">
      <navLabel><text>Title Page</text></navLabel>
      <content src="title.xhtml"/>
    </navPoint>
    <navPoint id="navpoint-2" playOrder="2">
      <navLabel><text>Table of Contents</text></navLabel>
      <content src="toc.xhtml"/>
    </navPoint>
    ${chapters.map((chapter, index) => `
    <navPoint id="navpoint-${index + 3}" playOrder="${index + 3}">
      <navLabel><text>${escapeXML(chapter.title)}</text></navLabel>
      <content src="chapter${index + 1}.xhtml"/>
    </navPoint>`).join('')}
  </navMap>
</ncx>`;
}

function createKindleCSS(options: ExportOptions): string {
  return `
/* Kindle-optimized styles */
body {
  font-family: ${options.fontFamily || 'Georgia, serif'};
  font-size: ${options.fontSize || 12}pt;
  line-height: ${options.lineSpacing || 1.6};
  margin: 0;
  padding: 1em;
}

h1, h2, h3 {
  page-break-before: always;
  margin-top: 2em;
  margin-bottom: 1em;
  font-weight: bold;
}

h1 { font-size: 1.5em; }
h2 { font-size: 1.3em; }
h3 { font-size: 1.1em; }

p {
  text-align: justify;
  text-indent: 1.5em;
  margin: 0;
  margin-bottom: 0.5em;
}

.title-page {
  text-align: center;
  page-break-after: always;
}

.chapter-title {
  text-align: center;
  font-size: 1.5em;
  margin-bottom: 2em;
  page-break-before: always;
}

@media amzn-kf8 {
  body { font-family: serif; }
}
`;
}

function createEPUBCSS(options: ExportOptions): string {
  return `
/* Standard EPUB styles */
body {
  font-family: ${options.fontFamily || 'Georgia, serif'};
  font-size: ${options.fontSize || 12}pt;
  line-height: ${options.lineSpacing || 1.6};
  margin: 0;
  padding: 1em;
}

h1, h2, h3 {
  margin-top: 2em;
  margin-bottom: 1em;
  font-weight: bold;
}

p {
  text-align: justify;
  text-indent: 1.5em;
  margin-bottom: 0.5em;
}

.title-page {
  text-align: center;
  page-break-after: always;
}

.chapter-title {
  text-align: center;
  font-size: 1.5em;
  margin-bottom: 2em;
  page-break-before: always;
}
`;
}

function createTitlePage(book: Book): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>${escapeXML(book.title)}</title>
  <link rel="stylesheet" type="text/css" href="stylesheet.css"/>
</head>
<body>
  <div class="title-page">
    <h1>${escapeXML(book.title)}</h1>
    <h2>by ${escapeXML(book.author)}</h2>
    ${book.description ? `<p>${escapeXML(book.description)}</p>` : ''}
  </div>
</body>
</html>`;
}

function createTOCPage(book: Book): string {
  const chapters = Array.isArray(book.content) ? book.content : [];
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>Table of Contents</title>
  <link rel="stylesheet" type="text/css" href="stylesheet.css"/>
</head>
<body>
  <h1>Table of Contents</h1>
  <ul>
    ${chapters.map((chapter, index) => 
      `<li><a href="chapter${index + 1}.xhtml">${escapeXML(chapter.title)}</a></li>`
    ).join('\n    ')}
  </ul>
</body>
</html>`;
}

function createChapterXHTML(chapter: any, options: ExportOptions): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>${escapeXML(chapter.title)}</title>
  <link rel="stylesheet" type="text/css" href="stylesheet.css"/>
</head>
<body>
  <h1 class="chapter-title">${escapeXML(chapter.title)}</h1>
  <div class="chapter-content">
    ${formatChapterContent(chapter.content)}
  </div>
</body>
</html>`;
}

function createPDFHTML(book: Book, options: ExportOptions): string {
  const chapters = Array.isArray(book.content) ? book.content : [];
  const margins = options.margins || { top: 1, bottom: 1, left: 1, right: 1 };
  
  return `<!DOCTYPE html>
<html>
<head>
  <title>${escapeXML(book.title)}</title>
  <style>
    @page {
      size: ${options.paperSize === 'a4' ? 'A4' : '8.5in 11in'};
      margin: ${margins.top}in ${margins.right}in ${margins.bottom}in ${margins.left}in;
    }
    
    body {
      font-family: ${options.fontFamily || 'Georgia, serif'};
      font-size: ${options.fontSize || 12}pt;
      line-height: ${options.lineSpacing || 1.6};
    }
    
    .title-page {
      text-align: center;
      page-break-after: always;
      padding-top: 25%;
    }
    
    .chapter {
      page-break-before: always;
    }
    
    .chapter-title {
      font-size: 1.5em;
      margin-bottom: 2em;
      text-align: center;
    }
    
    p {
      text-align: justify;
      text-indent: 1.5em;
      margin-bottom: 0.5em;
    }
  </style>
</head>
<body>
  <div class="title-page">
    <h1>${escapeXML(book.title)}</h1>
    <h2>by ${escapeXML(book.author)}</h2>
  </div>
  
  ${chapters.map(chapter => `
    <div class="chapter">
      <h1 class="chapter-title">${escapeXML(chapter.title)}</h1>
      ${formatChapterContent(chapter.content)}
    </div>
  `).join('')}
</body>
</html>`;
}

function createWordHTML(book: Book, options: ExportOptions): string {
  const chapters = Array.isArray(book.content) ? book.content : [];
  
  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head>
  <meta charset="UTF-8">
  <title>${escapeXML(book.title)}</title>
  <style>
    body {
      font-family: ${options.fontFamily || 'Times New Roman, serif'};
      font-size: ${options.fontSize || 12}pt;
      line-height: ${options.lineSpacing || 1.6};
    }
    
    .title-page {
      text-align: center;
      page-break-after: always;
    }
    
    .chapter-title {
      font-size: 16pt;
      font-weight: bold;
      text-align: center;
      margin-bottom: 2em;
      page-break-before: always;
    }
    
    p {
      text-align: justify;
      text-indent: 0.5in;
      margin-bottom: 6pt;
    }
  </style>
</head>
<body>
  <div class="title-page">
    <h1>${escapeXML(book.title)}</h1>
    <h2>by ${escapeXML(book.author)}</h2>
  </div>
  
  ${chapters.map(chapter => `
    <div class="chapter">
      <h1 class="chapter-title">${escapeXML(chapter.title)}</h1>
      ${formatChapterContent(chapter.content)}
    </div>
  `).join('')}
</body>
</html>`;
}

function createPrintReadyHTML(book: Book, options: ExportOptions): string {
  // Similar to PDF but with print-optimized styles
  return createPDFHTML(book, {
    ...options,
    paperSize: options.paperSize || 'us-trade',
    margins: options.margins || { top: 0.75, bottom: 0.75, left: 0.75, right: 0.75 }
  });
}

// Utility functions

function formatChapterContent(content: string): string {
  return content
    .split('\n\n')
    .map(paragraph => `<p>${escapeXML(paragraph.trim())}</p>`)
    .join('\n');
}

function escapeXML(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Export preset configurations for different Amazon KDP formats

export const KDP_PRESETS: Record<string, ExportOptions> = {
  kindle: {
    format: 'kindle',
    includeImages: true,
    fontSize: 12,
    fontFamily: 'serif',
    lineSpacing: 1.5
  },
  
  paperback: {
    format: 'print-ready',
    includeImages: true,
    paperSize: 'us-trade',
    margins: { top: 0.75, bottom: 0.75, left: 0.75, right: 0.75 },
    fontSize: 11,
    fontFamily: 'Times New Roman, serif',
    lineSpacing: 1.4
  },
  
  hardcover: {
    format: 'print-ready',
    includeImages: true,
    paperSize: 'us-letter',
    margins: { top: 1, bottom: 1, left: 1, right: 1 },
    fontSize: 12,
    fontFamily: 'Georgia, serif',
    lineSpacing: 1.6
  },
  
  epub: {
    format: 'epub',
    includeImages: true,
    fontSize: 12,
    fontFamily: 'serif',
    lineSpacing: 1.5
  }
};