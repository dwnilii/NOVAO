import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Noto_Sans_Arabic } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { BackgroundBubbles } from '@/components/background-bubbles';
import { AuthProvider } from '@/hooks/use-auth';
import { LanguageProvider } from '@/context/language-context';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Novao',
  description: 'Novao - A Secure, Fast, and Reliable Private Service',
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
  },
};

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  display: 'swap',
  variable: '--font-noto-sans-arabic',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn('dark', inter.variable, notoSansArabic.variable)}>
      <head />
      <body className="font-body font-persian antialiased">
        <AuthProvider>
          <LanguageProvider>
            <BackgroundBubbles />
            <div className="relative z-10 flex min-h-screen flex-col">{children}</div>
            <Toaster />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
