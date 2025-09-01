import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Wand2, Edit, Rocket } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import type { BookOutline } from "@shared/schema";

interface BookGeneratorProps {
  onOutlineGenerated?: (outline: BookOutline) => void;
}

export default function BookGenerator({ onOutlineGenerated }: BookGeneratorProps) {
  const [genre, setGenre] = useState("");
  const [topic, setTopic] = useState("");
  const [targetLength, setTargetLength] = useState("");
  const [writingStyle, setWritingStyle] = useState("");
  const [generatedOutline, setGeneratedOutline] = useState<BookOutline | null>(null);

  const generateOutlineMutation = useMutation({
    mutationFn: async (data: { genre: string; topic: string; targetLength: string; writingStyle: string }) => {
      const response = await apiRequest("POST", "/api/generate/outline", data);
      return response.json();
    },
    onSuccess: (outline) => {
      setGeneratedOutline(outline);
      onOutlineGenerated?.(outline);
      toast({
        title: "Outline Generated",
        description: "Your book outline has been created successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate book outline. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerateOutline = () => {
    if (!genre || !topic || !targetLength || !writingStyle) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields before generating.",
        variant: "destructive",
      });
      return;
    }

    generateOutlineMutation.mutate({ genre, topic, targetLength, writingStyle });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Generation Form */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">AI Book Generator</h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="genre" className="text-sm font-medium mb-2 block">
                Book Genre
              </Label>
              <Select value={genre} onValueChange={setGenre}>
                <SelectTrigger data-testid="select-genre">
                  <SelectValue placeholder="Select a genre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mystery & Thriller">Mystery & Thriller</SelectItem>
                  <SelectItem value="Romance">Romance</SelectItem>
                  <SelectItem value="Fantasy & Sci-Fi">Fantasy & Sci-Fi</SelectItem>
                  <SelectItem value="Self-Help & Wellness">Self-Help & Wellness</SelectItem>
                  <SelectItem value="Children's Story">Children's Story</SelectItem>
                  <SelectItem value="Business & Finance">Business & Finance</SelectItem>
                  <SelectItem value="Biography & Memoir">Biography & Memoir</SelectItem>
                  <SelectItem value="History">History</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="topic" className="text-sm font-medium mb-2 block">
                Book Topic/Concept
              </Label>
              <Textarea 
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Describe your book idea, main theme, or provide an outline..."
                className="h-24 resize-none"
                data-testid="textarea-topic"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="targetLength" className="text-sm font-medium mb-2 block">
                  Target Length
                </Label>
                <Select value={targetLength} onValueChange={setTargetLength}>
                  <SelectTrigger data-testid="select-target-length">
                    <SelectValue placeholder="Select length" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Short Story (5K-15K words)">Short Story (5K-15K words)</SelectItem>
                    <SelectItem value="Novella (20K-50K words)">Novella (20K-50K words)</SelectItem>
                    <SelectItem value="Novel (60K-100K words)">Novel (60K-100K words)</SelectItem>
                    <SelectItem value="Epic Novel (100K+ words)">Epic Novel (100K+ words)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="writingStyle" className="text-sm font-medium mb-2 block">
                  Writing Style
                </Label>
                <Select value={writingStyle} onValueChange={setWritingStyle}>
                  <SelectTrigger data-testid="select-writing-style">
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Professional">Professional</SelectItem>
                    <SelectItem value="Conversational">Conversational</SelectItem>
                    <SelectItem value="Academic">Academic</SelectItem>
                    <SelectItem value="Creative">Creative</SelectItem>
                    <SelectItem value="Technical">Technical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button 
              onClick={handleGenerateOutline}
              disabled={generateOutlineMutation.isPending}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              data-testid="button-generate-outline"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              {generateOutlineMutation.isPending ? "Generating..." : "Generate Book Outline"}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Generated Outline Preview */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Generated Outline Preview</h3>
          
          {generatedOutline ? (
            <div className="space-y-3">
              {generatedOutline.chapters.map((chapter, index) => (
                <div 
                  key={index}
                  className="p-3 bg-secondary/50 rounded border-l-4 border-primary"
                  data-testid={`outline-chapter-${index}`}
                >
                  <h4 className="font-medium text-sm">{chapter.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{chapter.description}</p>
                </div>
              ))}
              
              <div className="mt-4 flex space-x-3">
                <Button 
                  variant="default" 
                  className="flex-1"
                  data-testid="button-edit-outline"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Outline
                </Button>
                <Button 
                  className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
                  data-testid="button-generate-full-book"
                >
                  <Rocket className="w-4 h-4 mr-2" />
                  Generate Full Book
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Wand2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Generate an outline to see the preview here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
