import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/dashboard";
import Upload from "@/pages/upload";
import Generator from "@/pages/generator";
import Editor from "@/pages/editor";
import Covers from "@/pages/covers";
import Metadata from "@/pages/metadata";
import Export from "@/pages/export";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/upload" component={Upload} />
      <Route path="/generator" component={Generator} />
      <Route path="/editor/:bookId?" component={Editor} />
      <Route path="/covers/:bookId?" component={Covers} />
      <Route path="/metadata/:bookId?" component={Metadata} />
      <Route path="/export/:bookId?" component={Export} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="dark">
          <Layout>
            <Router />
          </Layout>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
