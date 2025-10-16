"use client";

import { Button, type ButtonProps } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CopyButtonProps extends ButtonProps {
  textToCopy: string;
  toastMessage?: string;
}

export function CopyButton({ textToCopy, toastMessage, className, children, ...props }: CopyButtonProps) {
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    toast({
      title: "Copied!",
      description: toastMessage || "Content copied to clipboard.",
    });
  };

  return (
    <Button variant="outline" className={cn(className)} onClick={handleCopy} {...props}>
      {children ? (
        <>
          {children}
        </>
      ) : (
        <>
          <Copy className="mr-2 h-4 w-4" />
          Copy
        </>
      )}
    </Button>
  );
}
