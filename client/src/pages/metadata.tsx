import { useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Wand2, Save, Search, TrendingUp, Target } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { useBooks } from "@/hooks/useBooks";

export default function Metadata() {
  const params = useParams();
  const bookId = params.bookId;
  
  const { data: books = [] } = useBooks();
  const currentBook = books.find(book => book.id === bookId) || books[0];

  const [title, setTitle] = useState(currentBook?.title || "");
  const [description, setDescription] = useState(currentBook?.description || "");
  const [keywords, setKeywords] = useState<string[]>(currentBook?.keywords || []);
  const [genre, setGenre] = useState(currentBook?.genre || "");
  const [newKeyword, setNewKeyword] = useState("");
  const [pricing, setPricing] = useState({ ebook: "2.99", paperback: "12.99", hardcover: "24.99" });

  const generateDescriptionMutation = useMutation({
    mutationFn: async () => {
      if (!currentBook) throw new Error("No book selected");
      const response = await apiRequest("POST", "/api/generate/description", {
        title: currentBook.title,
        genre: currentBook.genre,
        outline: { chapters: currentBook.content || [] }
      });
      return response.json();
    },
    onSuccess: (result) => {
      setDescription(result.description);
      toast({
        title: "Description Generated",
        description: "AI-generated book description has been created.",
      });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate description. Please try again.",
        variant: "destructive",
      });
    },
  });

  const generateKeywordsMutation = useMutation({
    mutationFn: async () => {
      if (!title || !genre || !description) {
        throw new Error("Please fill in title, genre, and description first");
      }
      const response = await apiRequest("POST", "/api/generate/keywords", {
        title,
        genre,
        description
      });
      return response.json();
    },
    onSuccess: (result) => {
      setKeywords(result.keywords);
      toast({
        title: "Keywords Generated",
        description: "SEO keywords have been generated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate keywords.",
        variant: "destructive",
      });
    },
  });

  const saveMetadataMutation = useMutation({
    mutationFn: async () => {
      if (!currentBook) throw new Error("No book selected");
      const response = await apiRequest("PATCH", `/api/books/${currentBook.id}`, {
        title,
        description,
        keywords,
        genre
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Metadata Saved",
        description: "Book metadata has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "Failed to save metadata. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords([...keywords, newKeyword.trim()]);
      setNewKeyword("");
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    setKeywords(keywords.filter(keyword => keyword !== keywordToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addKeyword();
    }
  };

  if (!currentBook) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No book selected. Please select a book to edit metadata.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Book Selection */}
      {books.length > 1 && (
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <Label className="text-sm font-medium mb-2 block">Select Book</Label>
            <Select value={currentBook.id} onValueChange={(value) => window.location.href = `/metadata/${value}`}>
              <SelectTrigger data-testid="select-book">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {books.map((book) => (
                  <SelectItem key={book.id} value={book.id}>
                    {book.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-sm font-medium mb-2 block">
                  Book Title
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter book title"
                  data-testid="input-book-title"
                />
              </div>

              <div>
                <Label htmlFor="genre" className="text-sm font-medium mb-2 block">
                  Genre/Category
                </Label>
                <Select value={genre} onValueChange={setGenre}>
                  <SelectTrigger data-testid="select-genre">
                    <SelectValue placeholder="Select genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fiction">Fiction</SelectItem>
                    <SelectItem value="Mystery & Thriller">Mystery & Thriller</SelectItem>
                    <SelectItem value="Romance">Romance</SelectItem>
                    <SelectItem value="Fantasy & Sci-Fi">Fantasy & Sci-Fi</SelectItem>
                    <SelectItem value="Self-Help & Wellness">Self-Help & Wellness</SelectItem>
                    <SelectItem value="Business & Finance">Business & Finance</SelectItem>
                    <SelectItem value="Biography & Memoir">Biography & Memoir</SelectItem>
                    <SelectItem value="Children's Books">Children's Books</SelectItem>
                    <SelectItem value="History">History</SelectItem>
                    <SelectItem value="Science & Technology">Science & Technology</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Book Description
                  </Label>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => generateDescriptionMutation.mutate()}
                    disabled={generateDescriptionMutation.isPending}
                    data-testid="button-generate-description"
                  >
                    <Wand2 className="w-4 h-4 mr-2" />
                    {generateDescriptionMutation.isPending ? "Generating..." : "AI Generate"}
                  </Button>
                </div>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter compelling book description that will attract readers..."
                  className="h-32 resize-none"
                  data-testid="textarea-description"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {description.length}/2000 characters • Aim for 150-250 words
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SEO & Keywords */}
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">SEO & Keywords</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">Keywords</Label>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => generateKeywordsMutation.mutate()}
                    disabled={generateKeywordsMutation.isPending || !title || !genre || !description}
                    data-testid="button-generate-keywords"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    {generateKeywordsMutation.isPending ? "Generating..." : "AI Generate"}
                  </Button>
                </div>
                
                <div className="flex space-x-2 mb-3">
                  <Input
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add keyword"
                    className="flex-1"
                    data-testid="input-new-keyword"
                  />
                  <Button onClick={addKeyword} size="sm" data-testid="button-add-keyword">
                    Add
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2 min-h-[2rem]">
                  {keywords.map((keyword, index) => (
                    <Badge 
                      key={index}
                      variant="secondary" 
                      className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => removeKeyword(keyword)}
                      data-testid={`keyword-badge-${index}`}
                    >
                      {keyword} ×
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {keywords.length}/15 keywords • Click to remove
                </p>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Target Audience</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <Target className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Primary:</span>
                    <span>Adults 25-45 interested in {genre.toLowerCase()}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Market:</span>
                    <span>English-speaking readers worldwide</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Strategy */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Pricing Strategy</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="ebook-price" className="text-sm font-medium mb-2 block">
                eBook Price
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="ebook-price"
                  value={pricing.ebook}
                  onChange={(e) => setPricing({...pricing, ebook: e.target.value})}
                  className="pl-7"
                  data-testid="input-ebook-price"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Recommended: $0.99 - $9.99</p>
            </div>
            
            <div>
              <Label htmlFor="paperback-price" className="text-sm font-medium mb-2 block">
                Paperback Price
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="paperback-price"
                  value={pricing.paperback}
                  onChange={(e) => setPricing({...pricing, paperback: e.target.value})}
                  className="pl-7"
                  data-testid="input-paperback-price"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Recommended: $8.99 - $24.99</p>
            </div>
            
            <div>
              <Label htmlFor="hardcover-price" className="text-sm font-medium mb-2 block">
                Hardcover Price
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="hardcover-price"
                  value={pricing.hardcover}
                  onChange={(e) => setPricing({...pricing, hardcover: e.target.value})}
                  className="pl-7"
                  data-testid="input-hardcover-price"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Recommended: $19.99 - $39.99</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metadata Tips */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Optimization Tips</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Description Best Practices</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Start with a compelling hook</li>
                <li>• Highlight the main conflict or benefit</li>
                <li>• Use emotional language that resonates</li>
                <li>• Include relevant keywords naturally</li>
                <li>• End with a call-to-action</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Keyword Strategy</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Research competitor keywords</li>
                <li>• Mix broad and specific terms</li>
                <li>• Include genre-specific phrases</li>
                <li>• Consider seasonal keywords</li>
                <li>• Update keywords based on performance</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={() => saveMetadataMutation.mutate()}
          disabled={saveMetadataMutation.isPending}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          data-testid="button-save-metadata"
        >
          <Save className="w-4 h-4 mr-2" />
          {saveMetadataMutation.isPending ? "Saving..." : "Save Metadata"}
        </Button>
      </div>
    </div>
  );
}
