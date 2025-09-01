import { useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Download, 
  FileText, 
  BookOpen, 
  Upload, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Printer,
  Smartphone,
  Globe
} from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { useBooks } from "@/hooks/useBooks";
import { exportBook, KDP_PRESETS, type ExportOptions } from "@/lib/exportUtils";

interface ExportFormat {
  id: string;
  name: string;
  description: string;
  icon: any;
  formats: string[];
  status: "ready" | "generating" | "completed" | "error";
  fileUrl?: string;
}

export default function Export() {
  const params = useParams();
  const bookId = params.bookId;
  
  const { data: books = [] } = useBooks();
  const currentBook = books.find(book => book.id === bookId) || books[0];

  const [exportProgress, setExportProgress] = useState(0);
  const [exportFormats, setExportFormats] = useState<ExportFormat[]>([
    {
      id: "kindle",
      name: "Kindle eBook",
      description: "MOBI format for Amazon Kindle devices and apps",
      icon: Smartphone,
      formats: [".mobi", ".azw3"],
      status: "ready"
    },
    {
      id: "epub",
      name: "EPUB eBook", 
      description: "Standard eBook format for most readers",
      icon: BookOpen,
      formats: [".epub"],
      status: "ready"
    },
    {
      id: "pdf-ebook",
      name: "PDF eBook",
      description: "PDF optimized for digital reading",
      icon: FileText,
      formats: [".pdf"],
      status: "ready"
    },
    {
      id: "print-ready",
      name: "Print-Ready PDF",
      description: "High-resolution PDF for paperback printing",
      icon: Printer,
      formats: [".pdf"],
      status: "ready"
    },
    {
      id: "kdp-package",
      name: "KDP Upload Package",
      description: "Complete package ready for Amazon KDP upload",
      icon: Upload,
      formats: [".zip"],
      status: "ready"
    },
    {
      id: "web-preview",
      name: "Web Preview",
      description: "HTML version for online preview and sharing",
      icon: Globe,
      formats: [".html"],
      status: "ready"
    }
  ]);

  const generateExportMutation = useMutation({
    mutationFn: async (formatId: string) => {
      if (!currentBook) throw new Error("No book selected");
      
      // Progress simulation for UI feedback
      setExportProgress(0);
      const interval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      try {
        // Use the comprehensive export system
        const options: ExportOptions = getExportOptions(formatId);
        await exportBook(currentBook, options);
        
        clearInterval(interval);
        setExportProgress(100);
        
        return { 
          fileUrl: `exported-${currentBook.title}-${formatId}`,
          format: formatId 
        };
      } catch (error) {
        clearInterval(interval);
        throw error;
      }
    },
    onSuccess: (result: any) => {
      setExportFormats(prev => 
        prev.map(format => 
          format.id === result.format 
            ? { ...format, status: "completed" as const, fileUrl: result.fileUrl }
            : format
        )
      );
      setExportProgress(0);
      toast({
        title: "Export Complete",
        description: "Your book has been exported successfully.",
      });
    },
    onError: (error, formatId) => {
      setExportFormats(prev => 
        prev.map(format => 
          format.id === formatId 
            ? { ...format, status: "error" as const }
            : format
        )
      );
      setExportProgress(0);
      toast({
        title: "Export Failed",
        description: "Failed to export book. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleExport = (formatId: string) => {
    setExportFormats(prev => 
      prev.map(format => 
        format.id === formatId 
          ? { ...format, status: "generating" as const }
          : format
      )
    );
    generateExportMutation.mutate(formatId);
  };

  const getExportOptions = (formatId: string): ExportOptions => {
    switch (formatId) {
      case 'kindle':
        return KDP_PRESETS.kindle;
      case 'epub':
        return KDP_PRESETS.epub;
      case 'print-ready':
        return KDP_PRESETS.paperback;
      case 'pdf-ebook':
        return {
          format: 'pdf',
          includeImages: true,
          fontSize: 12,
          fontFamily: 'Georgia, serif',
          lineSpacing: 1.5
        };
      case 'kdp-package':
        return {
          format: 'kindle',
          includeImages: true,
          fontSize: 12,
          fontFamily: 'serif',
          lineSpacing: 1.5
        };
      case 'web-preview':
        return {
          format: 'docx',
          includeImages: true,
          fontSize: 12,
          fontFamily: 'Arial, sans-serif',
          lineSpacing: 1.5
        };
      default:
        return KDP_PRESETS.kindle;
    }
  };

  const downloadFile = (format: ExportFormat) => {
    if (format.fileUrl) {
      const link = document.createElement('a');
      link.href = format.fileUrl;
      link.download = `${currentBook?.title || 'book'}_${format.id}${format.formats[0]}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "generating": return <Clock className="w-4 h-4 text-amber-500" />;
      case "error": return <AlertCircle className="w-4 h-4 text-destructive" />;
      default: return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed": return "Ready to Download";
      case "generating": return "Generating...";
      case "error": return "Error";
      default: return "Ready to Export";
    }
  };

  if (!currentBook) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No book selected. Please select a book to export.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Book Info */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold" data-testid="export-book-title">
                {currentBook.title}
              </h2>
              <p className="text-muted-foreground" data-testid="export-book-author">
                by {currentBook.author}
              </p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                <span data-testid="export-book-chapters">
                  {currentBook.content?.length || 0} Chapters
                </span>
                <span data-testid="export-book-genre">
                  {currentBook.genre}
                </span>
                <Badge variant="outline" data-testid="export-book-status">
                  {currentBook.status}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Progress */}
      {generateExportMutation.isPending && (
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Exporting Book</h3>
                <span className="text-sm text-muted-foreground">{exportProgress}%</span>
              </div>
              <Progress value={exportProgress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                Generating your book in the selected format. This may take a few minutes...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export Formats */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Export Formats</h3>
          
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            {exportFormats.map((format) => {
              const Icon = format.icon;
              return (
                <div 
                  key={format.id}
                  className="p-3 sm:p-4 bg-secondary/50 rounded-lg border border-border"
                  data-testid={`export-format-${format.id}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mt-1">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium" data-testid={`format-name-${format.id}`}>
                          {format.name}
                        </h4>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(format.status)}
                          <span className="text-xs text-muted-foreground">
                            {getStatusText(format.status)}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2" data-testid={`format-description-${format.id}`}>
                        {format.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-1">
                          {format.formats.map((ext, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {ext}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex space-x-2">
                          {format.status === "completed" ? (
                            <Button 
                              size="sm"
                              onClick={() => downloadFile(format)}
                              data-testid={`button-download-${format.id}`}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          ) : format.status === "generating" ? (
                            <Button size="sm" disabled>
                              <Clock className="w-4 h-4 mr-2" />
                              Generating...
                            </Button>
                          ) : (
                            <Button 
                              size="sm"
                              onClick={() => handleExport(format.id)}
                              disabled={generateExportMutation.isPending}
                              data-testid={`button-export-${format.id}`}
                            >
                              Export
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Publishing Checklist */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Publishing Checklist</h3>
          
          <div className="space-y-3">
            {[
              { task: "Book content completed and edited", completed: true },
              { task: "Cover design finalized", completed: !!currentBook.coverUrl },
              { task: "Metadata and keywords optimized", completed: !!currentBook.description },
              { task: "Pricing strategy set", completed: false },
              { task: "Copyright page included", completed: false },
              { task: "Final proofread completed", completed: false },
              { task: "Export files generated", completed: exportFormats.some(f => f.status === "completed") },
            ].map((item, index) => (
              <div 
                key={index}
                className="flex items-center space-x-3"
                data-testid={`checklist-item-${index}`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  item.completed 
                    ? "bg-green-500 text-white" 
                    : "bg-secondary border border-border"
                }`}>
                  {item.completed && <CheckCircle className="w-3 h-3" />}
                </div>
                <span className={item.completed ? "text-foreground" : "text-muted-foreground"}>
                  {item.task}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Amazon KDP Guidelines */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Amazon KDP Guidelines</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">eBook Requirements</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• File size: Less than 650 MB</li>
                <li>• Formats: MOBI, EPUB, or PDF</li>
                <li>• DRM-free content only</li>
                <li>• Professional formatting required</li>
                <li>• Copyright page must be included</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Print Book Requirements</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Minimum 24 pages for paperback</li>
                <li>• 300 DPI resolution for images</li>
                <li>• Bleed area: 0.125" on all sides</li>
                <li>• ISBN required for wide distribution</li>
                <li>• Professional cover design essential</li>
              </ul>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium mb-1">Ready to Publish?</h4>
              <p className="text-sm text-muted-foreground">
                Make sure all checklist items are completed before uploading to KDP.
              </p>
            </div>
            <Button 
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              data-testid="button-publish-to-kdp"
            >
              <Upload className="w-4 h-4 mr-2" />
              Publish to KDP
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
