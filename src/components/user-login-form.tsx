"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "./ui/skeleton";

type UserLoginFormProps = {
  className?: string;
};

export function UserLoginForm({ className }: UserLoginFormProps) {
  const router = useRouter();
  const { user, login, loading } = useAuth();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // If the user is already logged in, redirect them.
    if (!loading && user) {
      if (user.name === 'admin') {
        router.replace("/admin/dashboard");
      } else {
        router.replace("/dashboard");
      }
    }
  }, [user, loading, router]);


  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // This function now only handles portal login, not panel authentication.
    const loginResult = await login(username, password);

    if (loginResult.success) {
      toast({
        title: "Login Successful",
        description: `Welcome back, ${loginResult.user?.name}!`,
      });
      // Redirect based on user role. Admin should not use this form but handle anyway.
      if (loginResult.user?.name === 'admin') {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    } else {
      toast({
        title: "Login Failed",
        description: loginResult.message,
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

    // While checking auth state, show a skeleton loader
  if (loading || (!loading && user)) {
     return (
      <Card className={cn("bg-background/25 backdrop-blur-xl backdrop-saturate-125", className)}>
        <CardHeader>
          <CardTitle className="text-2xl">User Login</CardTitle>
          <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
           <div className="flex flex-col gap-2 pt-2">
             <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
     )
  }

  return (
    <Card className={cn("bg-background/25 backdrop-blur-xl backdrop-saturate-125", className)}>
      <CardHeader>
        <CardTitle className="text-2xl">User Login</CardTitle>
        <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleLogin}>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input 
              id="username" 
              type="text" 
              placeholder="Enter your username" 
              required 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              required 
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </div>
           <div className="text-center text-sm text-muted-foreground pt-2">
            Are you an admin?{" "}
            <Link
              href="/admin-login"
              className="font-medium text-primary hover:underline"
            >
              Go to Admin Login
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
