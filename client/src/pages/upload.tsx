import FileUpload from "@/components/FileUpload";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle, Clock } from "lucide-react";
import { useState } from "react";

interface ProcessedFile {
  id: string;
  name: string;
  text: string;
  summary: string;
  wordCount: number;
  status: "processing" | "completed" | "error";
}

export default function Upload() {
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);

  const handleUploadComplete = (result: any) => {
    const newFile: ProcessedFile = {
      id: Date.now().toString(),
      name: result.fileName || "document.txt",
      text: result.text || "",
      summary: result.summary || "",
      wordCount: result.wordCount || 0,
      status: "completed"
    };
    
    setProcessedFiles(prev => [...prev, newFile]);
  };

  const createBookFromFile = (file: ProcessedFile) => {
    // TODO: Implement book creation from processed file
    console.log("Creating book from file:", file);
  };

  return (
    <div className="space-y-6">
      {/* Upload Component */}
      <FileUpload onUploadComplete={handleUploadComplete} />

      {/* Processing History */}
      {processedFiles.length > 0 && (
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Processed Documents</h3>
            
            <div className="space-y-4">
              {processedFiles.map((file) => (
                <div 
                  key={file.id}
                  className="flex items-center space-x-4 p-4 bg-secondary/50 rounded-lg"
                  data-testid={`processed-file-${file.id}`}
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-medium" data-testid={`file-name-${file.id}`}>
                      {file.name}
                    </h4>
                    <p className="text-sm text-muted-foreground" data-testid={`file-summary-${file.id}`}>
                      {file.summary}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                      <span data-testid={`file-word-count-${file.id}`}>
                        {file.wordCount.toLocaleString()} words
                      </span>
                      <div className="flex items-center space-x-1">
                        {file.status === "completed" && (
                          <>
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            <span>Processed</span>
                          </>
                        )}
                        {file.status === "processing" && (
                          <>
                            <Clock className="w-3 h-3 text-amber-500" />
                            <span>Processing...</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => createBookFromFile(file)}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                      data-testid={`button-create-book-${file.id}`}
                    >
                      Create Book
                    </Button>
                    <Button 
                      variant="secondary"
                      data-testid={`button-download-${file.id}`}
                    >
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Processing Tips</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Supported Formats</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• PDF documents with text extraction</li>
                <li>• Microsoft Word (.docx) files</li>
                <li>• OpenDocument Text (.odt) files</li>
                <li>• Rich Text Format (.rtf) files</li>
                <li>• Plain text (.txt) and Markdown (.md) files</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Best Practices</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Ensure text is readable and well-formatted</li>
                <li>• Include chapter headings for better organization</li>
                <li>• Remove headers/footers for cleaner extraction</li>
                <li>• Check extracted text before creating books</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
