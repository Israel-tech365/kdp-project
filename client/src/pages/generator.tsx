import BookGenerator from "@/components/BookGenerator";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wand2, BookOpen, Clock, CheckCircle } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import type { BookOutline } from "@shared/schema";

interface GeneratedBook {
  id: string;
  title: string;
  genre: string;
  outline: BookOutline;
  status: "outline" | "generating" | "completed";
  progress: number;
}

export default function Generator() {
  const [generatedBooks, setGeneratedBooks] = useState<GeneratedBook[]>([]);

  const handleOutlineGenerated = (outline: BookOutline) => {
    const newBook: GeneratedBook = {
      id: Date.now().toString(),
      title: outline.chapters[0]?.title || "Untitled Book",
      genre: "Fiction", // Default for now
      outline,
      status: "outline",
      progress: 0
    };
    
    setGeneratedBooks(prev => [...prev, newBook]);
  };

  const generateFullBook = (bookId: string) => {
    setGeneratedBooks(prev => 
      prev.map(book => 
        book.id === bookId 
          ? { ...book, status: "generating" as const, progress: 10 }
          : book
      )
    );
    
    // Simulate book generation progress
    const progressInterval = setInterval(() => {
      setGeneratedBooks(prev => 
        prev.map(book => {
          if (book.id === bookId && book.status === "generating") {
            const newProgress = Math.min(book.progress + 10, 100);
            const newStatus: "outline" | "generating" | "completed" = newProgress === 100 ? "completed" : "generating";
            return { ...book, progress: newProgress, status: newStatus };
          }
          return book;
        })
      );
    }, 1000);

    setTimeout(() => clearInterval(progressInterval), 10000);
  };

  return (
    <div className="space-y-6">
      {/* Main Generator */}
      <BookGenerator onOutlineGenerated={handleOutlineGenerated} />

      {/* Generation Templates */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Start Templates</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 text-left"
              data-testid="template-mystery"
            >
              <div>
                <h4 className="font-medium mb-1">Mystery Novel</h4>
                <p className="text-sm text-muted-foreground">Detective story with twists and turns</p>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-4 text-left"
              data-testid="template-self-help"
            >
              <div>
                <h4 className="font-medium mb-1">Self-Help Guide</h4>
                <p className="text-sm text-muted-foreground">Practical advice and actionable tips</p>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-4 text-left"
              data-testid="template-children"
            >
              <div>
                <h4 className="font-medium mb-1">Children's Story</h4>
                <p className="text-sm text-muted-foreground">Engaging tales for young readers</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generated Books */}
      {generatedBooks.length > 0 && (
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Generated Books</h3>
            
            <div className="space-y-4">
              {generatedBooks.map((book) => (
                <div 
                  key={book.id}
                  className="flex items-center space-x-4 p-4 bg-secondary/50 rounded-lg"
                  data-testid={`generated-book-${book.id}`}
                >
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Wand2 className="w-6 h-6 text-accent" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium" data-testid={`book-title-${book.id}`}>
                        {book.title}
                      </h4>
                      <Badge variant="secondary" data-testid={`book-genre-${book.id}`}>
                        {book.genre}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      {book.outline.chapters.length} chapters outlined
                    </p>
                    
                    <div className="flex items-center space-x-2">
                      {book.status === "outline" && (
                        <>
                          <BookOpen className="w-4 h-4 text-blue-500" />
                          <span className="text-sm text-blue-500">Outline ready</span>
                        </>
                      )}
                      {book.status === "generating" && (
                        <>
                          <Clock className="w-4 h-4 text-amber-500" />
                          <span className="text-sm text-amber-500">Generating... {book.progress}%</span>
                        </>
                      )}
                      {book.status === "completed" && (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-green-500">Generation complete</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    {book.status === "outline" && (
                      <Button 
                        onClick={() => generateFullBook(book.id)}
                        className="bg-accent text-accent-foreground hover:bg-accent/90"
                        data-testid={`button-generate-full-${book.id}`}
                      >
                        Generate Full Book
                      </Button>
                    )}
                    
                    {book.status === "completed" && (
                      <Link href={`/editor/${book.id}`}>
                        <Button 
                          className="bg-primary text-primary-foreground hover:bg-primary/90"
                          data-testid={`button-edit-book-${book.id}`}
                        >
                          Edit Book
                        </Button>
                      </Link>
                    )}
                    
                    <Button 
                      variant="secondary"
                      data-testid={`button-view-outline-${book.id}`}
                    >
                      View Outline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
