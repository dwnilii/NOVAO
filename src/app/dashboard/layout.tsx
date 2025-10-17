'use client';

import type { ReactNode } from "react";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Zap, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { LanguageToggle } from "@/components/language-toggle";
import { LanguageProvider } from "@/context/language-context";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/user-login');
  };

  return (
    <LanguageProvider>
      <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background/25 px-4 backdrop-blur-xl backdrop-saturate-125 md:px-6 z-10">
          <nav className="flex w-full items-center justify-between">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 font-semibold"
            >
              <Zap className="h-6 w-6 text-primary" />
              <span className="text-lg">Novao</span>
            </Link>

            <div className="flex items-center gap-2">
               <LanguageToggle />
              <Button 
                variant="destructive" 
                onClick={handleLogout}
                className="bg-destructive/60 hover:bg-destructive/80 backdrop-blur-sm"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </nav>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          {children}
        </main>
      </div>
    </LanguageProvider>
  );
}
