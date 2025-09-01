import { useParams } from "wouter";
import CoverDesigner from "@/components/CoverDesigner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Eye, Star } from "lucide-react";
import { useState } from "react";

interface SavedCover {
  id: string;
  imageUrl: string;
  style: string;
  colorScheme: string;
  title: string;
  author: string;
  isSelected: boolean;
  createdAt: Date;
}

export default function Covers() {
  const params = useParams();
  const bookId = params.bookId;

  const [savedCovers, setSavedCovers] = useState<SavedCover[]>([
    {
      id: "1",
      imageUrl: "https://placehold.co/400x600/3b82f6/ffffff?text=Mystery+at+Moonlight+Manor",
      style: "Modern Minimalist",
      colorScheme: "blue-purple",
      title: "Mystery at Moonlight Manor",
      author: "Sarah Mitchell",
      isSelected: true,
      createdAt: new Date()
    },
    {
      id: "2", 
      imageUrl: "https://placehold.co/400x600/ef4444/ffffff?text=Mystery+at+Moonlight+Manor",
      style: "Classic Literature",
      colorScheme: "red-pink",
      title: "Mystery at Moonlight Manor",
      author: "Sarah Mitchell",
      isSelected: false,
      createdAt: new Date()
    }
  ]);

  const handleCoverGenerated = (coverUrl: string) => {
    const newCover: SavedCover = {
      id: Date.now().toString(),
      imageUrl: coverUrl,
      style: "AI Generated",
      colorScheme: "custom",
      title: "Mystery at Moonlight Manor",
      author: "Sarah Mitchell",
      isSelected: false,
      createdAt: new Date()
    };
    
    setSavedCovers(prev => [newCover, ...prev]);
  };

  const selectCover = (coverId: string) => {
    setSavedCovers(prev => 
      prev.map(cover => ({
        ...cover,
        isSelected: cover.id === coverId
      }))
    );
  };

  const downloadCover = (cover: SavedCover) => {
    // Create download link
    const link = document.createElement('a');
    link.href = cover.imageUrl;
    link.download = `${cover.title.replace(/\s+/g, '_')}_cover.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Cover Designer */}
      <CoverDesigner 
        initialTitle="Mystery at Moonlight Manor"
        initialAuthor="Sarah Mitchell"
        onCoverGenerated={handleCoverGenerated}
      />

      {/* Saved Covers */}
      {savedCovers.length > 0 && (
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Saved Covers</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {savedCovers.map((cover) => (
                <div 
                  key={cover.id}
                  className="space-y-4"
                  data-testid={`saved-cover-${cover.id}`}
                >
                  <div className="relative group">
                    <img
                      src={cover.imageUrl}
                      alt={cover.title}
                      className="w-full aspect-[2/3] object-cover rounded-lg border border-border"
                      data-testid={`cover-image-${cover.id}`}
                    />
                    
                    {cover.isSelected && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-primary text-primary-foreground">
                          <Star className="w-3 h-3 mr-1" />
                          Selected
                        </Badge>
                      </div>
                    )}
                    
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={() => {/* TODO: Implement preview */}}
                        data-testid={`button-preview-${cover.id}`}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={() => downloadCover(cover)}
                        data-testid={`button-download-${cover.id}`}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" data-testid={`cover-style-${cover.id}`}>
                        {cover.style}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {cover.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                    
                    <h4 className="font-medium text-sm mb-1" data-testid={`cover-title-${cover.id}`}>
                      {cover.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mb-3" data-testid={`cover-author-${cover.id}`}>
                      by {cover.author}
                    </p>
                    
                    <div className="flex space-x-2">
                      {!cover.isSelected ? (
                        <Button 
                          size="sm" 
                          onClick={() => selectCover(cover.id)}
                          className="flex-1"
                          data-testid={`button-select-${cover.id}`}
                        >
                          Select
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline"
                          disabled
                          className="flex-1"
                          data-testid={`button-selected-${cover.id}`}
                        >
                          <Star className="w-3 h-3 mr-1" />
                          Selected
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cover Tips */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Cover Design Tips</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Amazon KDP Requirements</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Minimum 2,560 × 1,600 pixels for print books</li>
                <li>• 1,563 × 2,500 pixels recommended for eBooks</li>
                <li>• RGB color mode for digital, CMYK for print</li>
                <li>• Keep text readable at thumbnail size</li>
                <li>• Avoid copyrighted images or fonts</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Design Best Practices</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Make title and author name prominent</li>
                <li>• Use genre-appropriate color schemes</li>
                <li>• Ensure contrast for readability</li>
                <li>• Test visibility as a small thumbnail</li>
                <li>• Consider your target audience</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
