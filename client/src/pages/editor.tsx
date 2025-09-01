import { useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Save, Plus, Wand2, Eye, FileText } from "lucide-react";
import { useState } from "react";

export default function Editor() {
  const params = useParams();
  const bookId = params.bookId;

  const [activeChapter, setActiveChapter] = useState(0);
  const [bookTitle, setBookTitle] = useState("Mystery at Moonlight Manor");
  const [chapterTitle, setChapterTitle] = useState("Chapter 1: The First Disappearance");
  const [chapterContent, setChapterContent] = useState(`Sarah Chen arrived in Moonhaven just as the summer fog began to lift from the harbor. The small coastal town seemed peaceful enough from her rental car window—quaint Victorian houses lined the hillside like colorful dominoes, their gardens bursting with hydrangeas and wild roses. But Sarah knew better than to trust first impressions.

She had been called here because people were vanishing.

The first disappearance had occurred three weeks ago. Marcus Webb, a local fisherman, had gone out on his boat one morning and never returned. The Coast Guard found his vessel drifting empty twelve miles offshore, its engine still running, fishing lines cast but untouched. No distress signal, no signs of struggle, no body.

The second disappearance followed a week later. This time it was Helen Rodriguez, the town librarian. She had locked up the library at her usual time on a Tuesday evening, walked the three blocks to her cottage, and simply vanished somewhere along that familiar route. Her purse was found in her garden, its contents scattered but nothing taken.

Now there was a third case, and the local police had finally admitted they needed help.`);

  const chapters = [
    { id: 1, title: "Chapter 1: The First Disappearance", wordCount: 1247, status: "completed" },
    { id: 2, title: "Chapter 2: Local Secrets", wordCount: 1089, status: "completed" },
    { id: 3, title: "Chapter 3: The Pattern Emerges", wordCount: 892, status: "draft" },
    { id: 4, title: "Chapter 4: Hidden Connections", wordCount: 0, status: "outline" },
    { id: 5, title: "Chapter 5: Breakthrough", wordCount: 0, status: "outline" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500/10 text-green-500";
      case "draft": return "bg-amber-500/10 text-amber-500";
      case "outline": return "bg-blue-500/10 text-blue-500";
      default: return "bg-gray-500/10 text-gray-500";
    }
  };

  const generateChapterContent = () => {
    // TODO: Implement AI chapter generation
    console.log("Generating content for chapter:", chapterTitle);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-8rem)]">
      {/* Chapter Navigation */}
      <Card className="bg-card border-border lg:col-span-1">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Chapters</h3>
            <Button size="sm" variant="outline" data-testid="button-add-chapter">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            {chapters.map((chapter, index) => (
              <div
                key={chapter.id}
                onClick={() => setActiveChapter(index)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  activeChapter === index 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-secondary"
                }`}
                data-testid={`chapter-item-${chapter.id}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium truncate">{chapter.title}</span>
                  <Badge 
                    className={`text-xs ${getStatusColor(chapter.status)}`}
                    data-testid={`chapter-status-${chapter.id}`}
                  >
                    {chapter.status}
                  </Badge>
                </div>
                <p className="text-xs opacity-75">
                  {chapter.wordCount > 0 ? `${chapter.wordCount} words` : "Not started"}
                </p>
              </div>
            ))}
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Chapters:</span>
              <span>{chapters.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Word Count:</span>
              <span>{chapters.reduce((total, ch) => total + ch.wordCount, 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Progress:</span>
              <span>40%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Editor */}
      <Card className="bg-card border-border lg:col-span-3">
        <CardContent className="p-6 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <Input 
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                className="text-xl font-bold bg-transparent border-none p-0 h-auto focus-visible:ring-0 mb-2"
                data-testid="input-book-title"
              />
              <Input 
                value={chapterTitle}
                onChange={(e) => setChapterTitle(e.target.value)}
                className="text-lg bg-transparent border-none p-0 h-auto focus-visible:ring-0"
                data-testid="input-chapter-title"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" data-testid="button-preview">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={generateChapterContent}
                data-testid="button-ai-assist"
              >
                <Wand2 className="w-4 h-4 mr-2" />
                AI Assist
              </Button>
              <Button size="sm" data-testid="button-save-chapter">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>

          {/* Content Editor */}
          <div className="flex-1">
            <Textarea
              value={chapterContent}
              onChange={(e) => setChapterContent(e.target.value)}
              placeholder="Start writing your chapter here..."
              className="w-full h-full resize-none border-none bg-transparent focus-visible:ring-0 text-base leading-7"
              data-testid="textarea-chapter-content"
            />
          </div>

          {/* Footer Stats */}
          <div className="flex items-center justify-between pt-4 border-t border-border text-sm text-muted-foreground">
            <div className="flex items-center space-x-4">
              <span data-testid="text-word-count">
                Words: {chapterContent.split(/\s+/).filter(word => word.length > 0).length}
              </span>
              <span data-testid="text-character-count">
                Characters: {chapterContent.length}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Auto-saved 2 minutes ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
