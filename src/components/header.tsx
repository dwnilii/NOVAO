'use client'

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/25 backdrop-blur-xl backdrop-saturate-125">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">Novao</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm md:flex">
          <Link href="#features" className="hover:text-primary">
            Features
          </Link>
           <Link href="#pricing" className="hover:text-primary">
            Pricing
          </Link>
          <Link href="/support" className="hover:text-primary">
            Support
          </Link>
        </nav>
        <Button asChild>
          <Link href="/login">Get Started</Link>
        </Button>
      </div>
    </header>
  );
}
