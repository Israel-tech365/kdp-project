import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Eye, EyeOff, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Login() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const loginMutation = useMutation({
    mutationFn: async (data: { username: string; password: string }) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Welcome back!",
        description: "You have been successfully logged in.",
      });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid username or password.",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: { username: string; email?: string; password: string }) => {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Account Created!",
        description: "Your account has been created successfully. You can now log in.",
      });
      setIsRegister(false);
      setFormData({ username: formData.username, email: "", password: "", confirmPassword: "" });
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Unable to create account. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isRegister) {
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Password Mismatch",
          description: "Passwords do not match. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      if (formData.password.length < 6) {
        toast({
          title: "Password Too Short",
          description: "Password must be at least 6 characters long.",
          variant: "destructive",
        });
        return;
      }

      registerMutation.mutate({
        username: formData.username,
        email: formData.email || undefined,
        password: formData.password
      });
    } else {
      loginMutation.mutate({
        username: formData.username,
        password: formData.password
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {isRegister ? "Create Account" : "Welcome Back"}
          </CardTitle>
          <p className="text-muted-foreground">
            {isRegister 
              ? "Join KDPublish to start creating and publishing books with AI"
              : "Sign in to your KDPublish account to continue"
            }
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                required
                disabled={isLoading}
                data-testid="input-username"
              />
            </div>

            {isRegister && (
              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  disabled={isLoading}
                  data-testid="input-email"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  required
                  disabled={isLoading}
                  data-testid="input-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  data-testid="toggle-password-visibility"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {isRegister && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  required
                  disabled={isLoading}
                  data-testid="input-confirm-password"
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              data-testid={isRegister ? "button-register" : "button-login"}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>{isRegister ? "Creating Account..." : "Signing In..."}</span>
                </div>
              ) : (
                <span>{isRegister ? "Create Account" : "Sign In"}</span>
              )}
            </Button>
          </form>

          <Separator />

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {isRegister ? "Already have an account?" : "Don't have an account?"}
            </p>
            <Button
              variant="link"
              className="text-primary hover:underline p-0 h-auto font-medium"
              onClick={() => {
                setIsRegister(!isRegister);
                setFormData({ username: "", email: "", password: "", confirmPassword: "" });
              }}
              disabled={isLoading}
              data-testid={isRegister ? "switch-to-login" : "switch-to-register"}
            >
              {isRegister ? "Sign in instead" : "Create an account"}
            </Button>
          </div>

          {/* Demo Account Info */}
          <div className="bg-secondary/50 rounded-lg p-4 border border-border">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-foreground">Demo Mode</p>
                <p className="text-muted-foreground">
                  You can create an account or use demo credentials to explore the platform.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}