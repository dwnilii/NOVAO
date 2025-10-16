import Link from "next/link";
import { Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-background/25 backdrop-blur-xl backdrop-saturate-125">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row">
        <div className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">Novao</span>
        </div>
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Novao. All rights reserved.
        </p>
        <div className="flex gap-4">
          <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">
            Terms of Service
          </Link>
          <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
