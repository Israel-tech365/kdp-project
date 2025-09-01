import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Palette } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface CoverDesignerProps {
  initialTitle?: string;
  initialAuthor?: string;
  onCoverGenerated?: (coverUrl: string) => void;
}

const colorSchemes = [
  { name: "Blue & Purple", value: "blue-purple", gradient: "from-blue-500 to-purple-600" },
  { name: "Red & Pink", value: "red-pink", gradient: "from-red-500 to-pink-600" },
  { name: "Green & Teal", value: "green-teal", gradient: "from-green-500 to-teal-600" },
  { name: "Dark & Elegant", value: "dark-elegant", gradient: "from-gray-700 to-gray-900" },
];

export default function CoverDesigner({ initialTitle = "", initialAuthor = "", onCoverGenerated }: CoverDesignerProps) {
  const [style, setStyle] = useState("");
  const [colorScheme, setColorScheme] = useState("");
  const [title, setTitle] = useState(initialTitle);
  const [author, setAuthor] = useState(initialAuthor);
  const [generatedCover, setGeneratedCover] = useState<string | null>(null);
  const [alternativeCovers, setAlternativeCovers] = useState<string[]>([]);

  const generateCoverMutation = useMutation({
    mutationFn: async (data: { title: string; author: string; genre: string; style: string }) => {
      const response = await apiRequest("POST", "/api/generate/cover", data);
      return response.json();
    },
    onSuccess: (result) => {
      setGeneratedCover(result.url);
      onCoverGenerated?.(result.url);
      
      // Generate some alternative covers for demo
      const alternatives = [
        `https://placehold.co/400x600/3b82f6/ffffff?text=${encodeURIComponent(title)}`,
        `https://placehold.co/400x600/ef4444/ffffff?text=${encodeURIComponent(title)}`,
        `https://placehold.co/400x600/10b981/ffffff?text=${encodeURIComponent(title)}`,
        `https://placehold.co/400x600/8b5cf6/ffffff?text=${encodeURIComponent(title)}`,
      ];
      setAlternativeCovers(alternatives);
      
      toast({
        title: "Cover Generated",
        description: "Your book cover has been created successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate book cover. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerateCover = () => {
    if (!style || !title || !author) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields before generating.",
        variant: "destructive",
      });
      return;
    }

    generateCoverMutation.mutate({ 
      title, 
      author, 
      genre: "Fiction", // Default genre for now
      style 
    });
  };

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">AI Cover Designer</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              <div>
                <Label htmlFor="coverStyle" className="text-sm font-medium mb-2 block">
                  Cover Style
                </Label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger data-testid="select-cover-style">
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Modern Minimalist">Modern Minimalist</SelectItem>
                    <SelectItem value="Classic Literature">Classic Literature</SelectItem>
                    <SelectItem value="Genre-Specific">Genre-Specific</SelectItem>
                    <SelectItem value="Photography-Based">Photography-Based</SelectItem>
                    <SelectItem value="Illustrated">Illustrated</SelectItem>
                    <SelectItem value="Typography-Focused">Typography-Focused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium mb-2 block">Color Scheme</Label>
                <div className="grid grid-cols-2 gap-2">
                  {colorSchemes.map((scheme) => (
                    <button
                      key={scheme.value}
                      onClick={() => setColorScheme(scheme.value)}
                      className={cn(
                        "w-full h-10 rounded bg-gradient-to-br transition-all",
                        scheme.gradient,
                        colorScheme === scheme.value 
                          ? "border-2 border-primary ring-2 ring-primary/20" 
                          : "border-2 border-transparent hover:border-primary"
                      )}
                      data-testid={`button-color-scheme-${scheme.value}`}
                      title={scheme.name}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <Label htmlFor="title" className="text-sm font-medium mb-2 block">
                  Title
                </Label>
                <Input 
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Your Book Title"
                  data-testid="input-book-title"
                />
              </div>
              
              <div>
                <Label htmlFor="author" className="text-sm font-medium mb-2 block">
                  Author Name
                </Label>
                <Input 
                  id="author"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Author Name"
                  data-testid="input-author-name"
                />
              </div>
              
              <Button 
                onClick={handleGenerateCover}
                disabled={generateCoverMutation.isPending}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                data-testid="button-generate-cover"
              >
                <Palette className="w-4 h-4 mr-2" />
                {generateCoverMutation.isPending ? "Generating..." : "Generate Cover"}
              </Button>
            </div>
          </div>
          
          {/* Preview */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Featured Cover */}
              <div className="md:col-span-1">
                <div className="book-cover-preview w-full rounded-lg bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 p-6 text-white relative overflow-hidden">
                  {generatedCover ? (
                    <img 
                      src={generatedCover} 
                      alt={title}
                      className="w-full h-full object-cover absolute inset-0"
                      data-testid="img-generated-cover"
                    />
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-black/20"></div>
                      <div className="relative z-10 h-full flex flex-col justify-between">
                        <div>
                          <h4 className="text-lg font-bold leading-tight" data-testid="text-cover-title">
                            {title || "Your Book Title"}
                          </h4>
                        </div>
                        <div className="text-center">
                          <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4">
                            <Palette className="w-8 h-8" />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium" data-testid="text-cover-author">
                            {author || "Author Name"}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <Button 
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    data-testid="button-select-cover"
                  >
                    Select This Cover
                  </Button>
                </div>
              </div>
              
              {/* Alternative Covers */}
              <div className="md:col-span-2">
                <h5 className="text-sm font-medium mb-3">Alternative Designs</h5>
                <div className="grid grid-cols-2 gap-3">
                  {alternativeCovers.length > 0 ? (
                    alternativeCovers.map((coverUrl, index) => (
                      <div 
                        key={index}
                        className="book-cover-preview w-full h-32 rounded bg-gradient-to-br from-gray-600 to-gray-800 p-3 text-white text-xs flex flex-col justify-between cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => setGeneratedCover(coverUrl)}
                        data-testid={`alternative-cover-${index}`}
                      >
                        <span className="font-bold">{title || "Book Title"}</span>
                        <span>{author || "Author"}</span>
                      </div>
                    ))
                  ) : (
                    Array.from({ length: 4 }).map((_, index) => (
                      <div 
                        key={index}
                        className={cn(
                          "book-cover-preview w-full h-32 rounded p-3 text-white text-xs flex flex-col justify-between cursor-pointer hover:scale-105 transition-transform bg-gradient-to-br",
                          colorSchemes[index]?.gradient || "from-gray-600 to-gray-800"
                        )}
                        data-testid={`placeholder-cover-${index}`}
                      >
                        <span className="font-bold">{title || "Book Title"}</span>
                        <span>{author || "Author"}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
