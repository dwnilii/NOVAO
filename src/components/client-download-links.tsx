'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FaAndroid, FaWindows, FaApple } from "react-icons/fa";
import { cn } from "@/lib/utils";


type ClientLinks = {
  android: string | null;
  windows: string | null;
  ios: string | null;
  macos: string | null;
};

interface ClientDownloadLinksProps {
  links: ClientLinks;
}

const iconMap = {
    android: <FaAndroid className="h-6 w-6" />,
    windows: <FaWindows className="h-6 w-6" />,
    ios: <FaApple className="h-6 w-6" />,
    macos: <FaApple className="h-6 w-6" />,
};

const platformNames = {
    android: "Android",
    windows: "Windows",
    ios: "iOS",
    macos: "macOS"
};

export function ClientDownloadLinks({ links }: ClientDownloadLinksProps) {
    const availableLinks = Object.entries(links).filter(([_, url]) => url);

    if (availableLinks.length === 0) {
        return null;
    }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Client Downloads</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {availableLinks.map(([platform, url]) => (
            <Button key={platform} asChild variant="outline" className="h-20 flex-col gap-2">
                <Link href={url!} target="_blank" rel="noopener noreferrer">
                    {iconMap[platform as keyof typeof iconMap]}
                    <span>{platformNames[platform as keyof typeof platformNames]}</span>
                </Link>
            </Button>
        ))}
      </CardContent>
    </Card>
  );
}
