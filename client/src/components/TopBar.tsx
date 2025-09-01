import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface TopBarProps {
  onMenuClick: () => void;
}

const pageData = {
  "/dashboard": { title: "Dashboard", subtitle: "Manage your publishing workflow" },
  "/upload": { title: "Upload Documents", subtitle: "Process your manuscripts and documents" },
  "/generator": { title: "AI Book Generator", subtitle: "Create books with artificial intelligence" },
  "/editor": { title: "Chapter Editor", subtitle: "Edit and refine your book content" },
  "/covers": { title: "Cover Designer", subtitle: "Create stunning book covers" },
  "/metadata": { title: "Metadata & SEO", subtitle: "Optimize your book for discoverability" },
  "/export": { title: "Export & Publish", subtitle: "Prepare your book for publishing" },
};

export default function TopBar({ onMenuClick }: TopBarProps) {
  const [location] = useLocation();
  const currentPage = pageData[location as keyof typeof pageData] || pageData["/dashboard"];

  return (
    <header className="bg-card border-b border-border p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuClick}
          className="lg:hidden"
          data-testid="button-mobile-menu"
        >
          <Menu className="w-4 h-4 text-muted-foreground" />
        </Button>
        <div>
          <h2 className="text-xl font-semibold" data-testid="text-page-title">
            {currentPage.title}
          </h2>
          <p className="text-sm text-muted-foreground" data-testid="text-page-subtitle">
            {currentPage.subtitle}
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* API Key Status */}
        <div className="flex items-center space-x-2 bg-secondary px-3 py-2 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-sm" data-testid="text-api-status">AI Connected</span>
        </div>
        
        {/* User Profile */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-accent"></div>
          <span className="text-sm font-medium" data-testid="text-user-name">Author Name</span>
        </div>
      </div>
    </header>
  );
}
