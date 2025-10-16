"use client";

import { useEffect, useState, FormEvent, useRef } from "react";
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
import { loginAdmin } from "@/app/admin-login/actions";
import type { User } from "@/lib/types";
import { ArrowLeft, Loader2 } from "lucide-react";
import { PinInput } from "./pin-input";

type AdminLoginFormProps = {
  className?: string;
};

async function verifyPinOnServer(pin: string): Promise<boolean> {
  try {
    const response = await fetch('/api/verify-pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    });
    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error("PIN verification request failed:", error);
    return false;
  }
}

export function AdminLoginForm({ className }: AdminLoginFormProps) {
  const router = useRouter();
  const { user, loading, checkUser } = useAuth();
  const { toast } = useToast();
  
  const [step, setStep] = useState<'pin' | 'credentials'>('pin');
  const [pin, setPin] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);
  const pinFormRef = useRef<HTMLFormElement>(null);

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
  
  useEffect(() => {
    if (pin.length === 4 && !isVerifyingPin) {
      pinFormRef.current?.requestSubmit();
    }
  }, [pin, isVerifyingPin]);
  
  const handlePinSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pin.length !== 4) return;
    
    setIsVerifyingPin(true);
    try {
      const isCorrect = await verifyPinOnServer(pin);
      if (isCorrect) {
          setStep('credentials');
      } else {
          toast({
              title: 'Invalid PIN',
              description: 'The PIN you entered is incorrect.',
              variant: 'destructive',
          });
          setPin(''); // Reset pin on failure
      }
    } catch (error) {
        toast({
            title: 'Verification Failed',
            description: 'Could not verify the PIN. Please try again.',
            variant: 'destructive',
        });
    } finally {
      setIsVerifyingPin(false);
    }
  };


  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await loginAdmin(username, password);

      if (result.success) {
        const adminUser: User = {
            id: 'admin_user',
            name: 'admin',
            uuid: 'admin_uuid_placeholder',
            subscription: 'active',
            usage: 999,
            total: 1000,
            registered: new Date().toISOString(),
        };
        localStorage.setItem('novao-user', JSON.stringify(adminUser));
        
        await checkUser();

        toast({
          title: "Login Successful",
          description: "Welcome back, admin!",
        });
        
        router.push("/admin/dashboard");
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
       toast({
        title: "Login Failed",
        description: error.message || "An unknown error occurred.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  if (loading || (!loading && user)) {
     return (
      <Card className={cn("bg-background/25 backdrop-blur-xl backdrop-saturate-125", className)}>
        <CardHeader>
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>Enter your admin credentials to access the management panel.</CardDescription>
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
      {step === 'pin' ? (
        <>
            <CardHeader>
                <CardTitle className="text-2xl">Admin Verification</CardTitle>
                <CardDescription>Please enter the 4-digit PIN to proceed.</CardDescription>
            </CardHeader>
            <CardContent>
                <form ref={pinFormRef} className="space-y-4" onSubmit={handlePinSubmit}>
                <div className="space-y-2">
                    <Label htmlFor="pin">Security PIN</Label>
                    <PinInput length={4} onComplete={setPin} disabled={isVerifyingPin} />
                </div>
                <Button type="submit" className="w-full" disabled={isVerifyingPin || pin.length !== 4}>
                   {isVerifyingPin ? <Loader2 className="animate-spin" /> : 'Continue'}
                </Button>
                <div className="text-center text-sm text-muted-foreground pt-2">
                  Not an admin?{" "}
                  <Link href="/user-login" className="font-medium text-primary hover:underline">
                    Go to User Login
                  </Link>
                </div>
                </form>
            </CardContent>
        </>
      ) : (
        <>
            <CardHeader>
                <div className='flex items-center gap-2'>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setStep('pin'); setPin(''); }}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <CardTitle className="text-2xl">Admin Login</CardTitle>
                        <CardDescription>Enter your admin credentials to access the management panel.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <form className="space-y-4" onSubmit={handleLogin}>
                <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input 
                    id="username" 
                    type="text" 
                    required 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isSubmitting}
                    autoComplete="username"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                    id="password" 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                    autoComplete="current-password"
                    />
                </div>
                <div className="flex flex-col gap-2 pt-2">
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="animate-spin" /> : 'Sign In'}
                    </Button>
                </div>
                </form>
            </CardContent>
        </>
      )}
    </Card>
  );
}
