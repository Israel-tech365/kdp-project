import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CloudUpload, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFileUpload } from "@/hooks/useFileUpload";

interface FileUploadProps {
  onUploadComplete?: (result: any) => void;
}

export default function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const { uploadFile, isUploading, progress, error } = useFileUpload();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const result = await uploadFile(file);
      if (result && onUploadComplete) {
        onUploadComplete(result);
      }
    }
  }, [uploadFile, onUploadComplete]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const result = await uploadFile(file);
      if (result && onUploadComplete) {
        onUploadComplete(result);
      }
    }
  }, [uploadFile, onUploadComplete]);

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Document Upload & Processing</h3>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <FileText className="w-4 h-4" />
            <span>Supports PDF, DOCX, ODT, RTF, TXT, MD, ODS, ODP</span>
          </div>
        </div>
        
        <div 
          className={cn(
            "file-drop-zone p-8 rounded-lg text-center transition-all",
            dragActive && "drag-over",
            isUploading && "opacity-50 pointer-events-none"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          data-testid="dropzone-file-upload"
        >
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <CloudUpload className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h4 className="text-lg font-medium mb-2">Drop files here or click to browse</h4>
              <p className="text-sm text-muted-foreground">Upload your manuscripts, outlines, or reference documents</p>
            </div>
            <div>
              <input
                type="file"
                onChange={handleFileSelect}
                accept=".pdf,.docx,.odt,.rtf,.txt,.md,.ods,.odp"
                className="hidden"
                id="file-upload"
                data-testid="input-file-upload"
              />
              <label htmlFor="file-upload">
                <Button 
                  className="cursor-pointer" 
                  disabled={isUploading}
                  data-testid="button-select-files"
                >
                  {isUploading ? "Uploading..." : "Select Files"}
                </Button>
              </label>
            </div>
          </div>
        </div>
        
        {/* Upload Progress */}
        {isUploading && (
          <div className="mt-6 space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-secondary/50 rounded">
              <div className="loading-spinner"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Processing document...</p>
                <p className="text-xs text-muted-foreground">Extracting text and images</p>
              </div>
              <span className="text-xs text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}
        
        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center justify-between">
            <p className="text-sm text-destructive" data-testid="text-upload-error">
              {error}
            </p>
            <Button variant="ghost" size="sm" onClick={() => {}}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
