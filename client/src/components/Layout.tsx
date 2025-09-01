import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 overflow-auto">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
