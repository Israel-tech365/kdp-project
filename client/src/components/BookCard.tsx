import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Book } from "@shared/schema";
import { Link } from "wouter";
import { BookOpen, MoreHorizontal } from "lucide-react";

interface BookCardProps {
  book: Book;
  onDelete?: (id: string) => void;
}

export default function BookCard({ book, onDelete }: BookCardProps) {
  const progress = book.progress || 0;
  
  const getCoverGradient = (title: string) => {
    const colors = [
      "from-blue-500 to-purple-600",
      "from-green-500 to-teal-600", 
      "from-red-500 to-pink-600",
      "from-orange-500 to-yellow-600",
      "from-purple-500 to-indigo-600"
    ];
    const index = title.length % colors.length;
    return colors[index];
  };

  return (
    <Card className="card-hover bg-secondary/50" data-testid={`card-book-${book.id}`}>
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <div className={`book-cover-preview w-12 h-16 rounded bg-gradient-to-br ${getCoverGradient(book.title)} flex items-center justify-center`}>
            {book.coverUrl ? (
              <img 
                src={book.coverUrl} 
                alt={book.title}
                className="w-full h-full object-cover rounded"
                data-testid={`img-book-cover-${book.id}`}
              />
            ) : (
              <BookOpen className="w-4 h-4 text-white" />
            )}
          </div>
          
          <div className="flex-1">
            <h4 className="font-medium" data-testid={`text-book-title-${book.id}`}>
              {book.title}
            </h4>
            <p className="text-sm text-muted-foreground" data-testid={`text-book-genre-${book.id}`}>
              {book.genre}
            </p>
            <div className="flex items-center space-x-2 mt-2">
              <Progress value={progress} className="flex-1 h-2" />
              <span className="text-xs text-muted-foreground" data-testid={`text-book-progress-${book.id}`}>
                {progress}%
              </span>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Link href={`/editor/${book.id}`}>
              <Button 
                size="sm" 
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                data-testid={`button-continue-${book.id}`}
              >
                Continue
              </Button>
            </Link>
            <Button 
              variant="secondary" 
              size="sm"
              data-testid={`button-menu-${book.id}`}
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
