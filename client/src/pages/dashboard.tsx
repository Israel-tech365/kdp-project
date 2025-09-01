import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Bot, Upload, BookOpen, Rocket, DollarSign, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import BookCard from "@/components/BookCard";
import { useBooks } from "@/hooks/useBooks";
import FileUpload from "@/components/FileUpload";
import BookGenerator from "@/components/BookGenerator";

export default function Dashboard() {
  const { data: books = [], isLoading: booksLoading } = useBooks();
  
  const { data: stats } = useQuery<{
    booksInProgress: number;
    publishedBooks: number;
    aiWordsGenerated: number;
    monthlyRevenue: string;
  }>({
    queryKey: ["/api/stats"],
  });

  const handleUploadComplete = (result: any) => {
    console.log("Upload completed:", result);
    // Could trigger a book creation flow here
  };

  const handleOutlineGenerated = (outline: any) => {
    console.log("Outline generated:", outline);
    // Could trigger book creation with the outline
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <Card className="card-hover bg-card border-border">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Books in Progress</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold" data-testid="stat-books-in-progress">
                  {stats?.booksInProgress ?? 0}
                </p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-hover bg-card border-border">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Published Books</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold" data-testid="stat-published-books">
                  {stats?.publishedBooks ?? 0}
                </p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <Rocket className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-hover bg-card border-border">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">AI Words Generated</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold" data-testid="stat-ai-words">
                  {stats?.aiWordsGenerated ? `${(stats.aiWordsGenerated / 1000).toFixed(1)}K` : "0"}
                </p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-hover bg-card border-border">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Monthly Revenue</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold" data-testid="stat-monthly-revenue">
                  {stats?.monthlyRevenue ?? "$0"}
                </p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-amber-500/10 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <Link href="/generator">
              <Button 
                className="p-4 h-auto bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-left w-full"
                data-testid="button-new-book-project"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <Plus className="w-5 h-5" />
                  <span className="font-medium">New Book Project</span>
                </div>
                <p className="text-sm opacity-90">Start a new book from scratch or upload existing content</p>
              </Button>
            </Link>
            
            <Link href="/generator">
              <Button 
                className="p-4 h-auto bg-accent text-accent-foreground hover:bg-accent/90 transition-colors text-left w-full"
                data-testid="button-ai-book-generator"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <Bot className="w-5 h-5" />
                  <span className="font-medium">AI Book Generator</span>
                </div>
                <p className="text-sm opacity-90">Generate a complete book using AI from your outline</p>
              </Button>
            </Link>
            
            <Link href="/upload">
              <Button 
                variant="secondary"
                className="p-4 h-auto transition-colors text-left w-full"
                data-testid="button-upload-documents"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <Upload className="w-5 h-5" />
                  <span className="font-medium">Upload Documents</span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Process PDF, DOCX, and other document formats</p>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Current Projects */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Current Projects</h3>
            <Link href="/generator">
              <Button variant="outline" size="sm" data-testid="button-view-all-projects">
                View All
              </Button>
            </Link>
          </div>
          
          <div className="space-y-4">
            {booksLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className="loading-spinner mx-auto mb-4"></div>
                <p>Loading your books...</p>
              </div>
            ) : books.length > 0 ? (
              books.slice(0, 3).map((book) => (
                <BookCard key={book.id} book={book} />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No books yet. Create your first book to get started!</p>
                <Link href="/generator">
                  <Button className="mt-4" data-testid="button-create-first-book">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Book
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Document Upload Section */}
      <FileUpload onUploadComplete={handleUploadComplete} />

      {/* AI Book Generator Section */}
      <BookGenerator onOutlineGenerated={handleOutlineGenerated} />
    </div>
  );
}
