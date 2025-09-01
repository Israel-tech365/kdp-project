import { useState, useCallback } from "react";
import { validateFileType, processDocument } from "@/lib/documentUtils";
import { toast } from "@/hooks/use-toast";

interface UploadResult {
  text: string;
  summary: string;
  wordCount: number;
  fileName: string;
  fileSize: number;
  images: Array<{ name: string; url: string }>;
}

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(async (file: File): Promise<UploadResult | null> => {
    if (!file) {
      setError("No file provided");
      return null;
    }

    if (!validateFileType(file.name)) {
      setError("Unsupported file type. Please upload PDF, DOCX, ODT, RTF, TXT, MD, ODS, or ODP files.");
      return null;
    }

    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Process the document on the client side
      const processed = await processDocument(file);
      
      // Complete the progress
      clearInterval(progressInterval);
      setProgress(100);

      // Prepare the result
      const result: UploadResult = {
        text: processed.text,
        summary: processed.summary,
        wordCount: processed.wordCount,
        fileName: file.name,
        fileSize: file.size,
        images: processed.images
      };

      // Optional: Send to server for additional AI processing
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });
        
        if (response.ok) {
          const serverResult = await response.json();
          // Merge server results with client processing
          result.text = serverResult.text || result.text;
          result.summary = serverResult.summary || result.summary;
          result.wordCount = serverResult.wordCount || result.wordCount;
        }
      } catch (serverError) {
        console.warn("Server processing failed, using client-side results:", serverError);
        // Continue with client-side results
      }

      setTimeout(() => {
        setIsUploading(false);
        setProgress(0);
      }, 500);

      toast({
        title: "Upload Complete",
        description: `Successfully processed ${file.name} (${result.wordCount} words)`,
      });

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to process file";
      setError(errorMessage);
      setIsUploading(false);
      setProgress(0);
      
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      return null;
    }
  }, []);

  const resetUpload = useCallback(() => {
    setIsUploading(false);
    setProgress(0);
    setError(null);
  }, []);

  return {
    uploadFile,
    isUploading,
    progress,
    error,
    resetUpload
  };
}
