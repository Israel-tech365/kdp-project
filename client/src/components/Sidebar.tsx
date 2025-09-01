import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Upload,
  Wand2,
  Edit3,
  Image,
  Tags,
  Download,
  Settings,
  X,
  BookOpen
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigationItems = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/upload", label: "Upload Documents", icon: Upload },
  { href: "/generator", label: "AI Book Generator", icon: Wand2 },
  { href: "/editor", label: "Chapter Editor", icon: Edit3 },
  { href: "/covers", label: "Cover Designer", icon: Image },
  { href: "/metadata", label: "Metadata & SEO", icon: Tags },
  { href: "/export", label: "Export & Publish", icon: Download },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={cn(
          "w-64 bg-card border-r border-border sidebar-transition fixed lg:static inset-y-0 left-0 z-50",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-bold gradient-text">KDP Publisher Pro</h1>
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden p-2 rounded-md hover:bg-secondary"
            data-testid="button-close-sidebar"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        
        <nav className="p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href || 
              (item.href !== "/dashboard" && location.startsWith(item.href));
            
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 p-3 rounded-lg transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                )}
                data-testid={`link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          
          <hr className="border-border my-4" />
          
          <Link 
            href="/settings"
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            data-testid="link-settings"
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </Link>
        </nav>
      </aside>
    </>
  );
}
