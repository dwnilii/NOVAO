'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';
import Link from 'next/link';
import type { PricingPlan } from '@/lib/types';
import { cn } from '@/lib/utils';

interface PricingCardProps {
  plan: PricingPlan;
}

// A decorative Visa-like logo component
function VisaLogo() {
    return (
        <svg width="48" height="48" viewBox="0 0 128 41" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white/80">
          <path d="M37.3303 0.838623H23.5358L15.4223 21.0536L13.259 13.9142L8.79093 0.838623H0.252441L11.5647 39.865H19.9882L37.3303 0.838623Z" fill="currentColor" fillOpacity="0.7"/>
          <path d="M60.9165 1.15796C58.3377 0.392906 55.4395 0 52.3314 0C42.4552 0 34.3418 5.63214 34.3418 13.9777C34.3418 20.354 39.8131 23.9536 43.5317 25.7533C47.2503 27.5531 48.6045 28.8475 48.6045 30.461C48.6045 32.562 46.2238 33.7929 43.645 33.7929C40.0454 33.7929 38.0097 32.8159 35.8464 31.8388L34.7733 40.1844C36.9366 40.8859 40.418 41.25 43.7449 41.25C54.108 41.25 62.2215 35.7491 62.2215 27.2797C62.2215 18.6384 54.4913 14.6183 49.3385 12.3996C45.3664 10.5998 43.9487 9.36886 43.9487 7.75533C43.9487 6.07828 45.892 5.03774 48.3882 5.03774C50.5515 5.03774 52.5872 5.58944 54.3057 6.35449L55.5921 6.14158C56.9464 5.92867 58.2372 5.31345 59.3738 4.41703L60.9165 1.15796Z" fill="currentColor"/>
          <path d="M85.4924 0.838623L78.7109 40.0179H87.402L94.1835 0.838623H85.4924Z" fill="currentColor"/>
          <path d="M109.843 0.838623L101.483 39.865H110.174L118.534 0.838623H109.843Z" fill="currentColor"/>
          <path d="M128 20.4184C128 31.5795 120.333 40.0179 111.409 40.0179L106.32 0.838623H115.553L115.872 3.16723C122.973 3.65476 128 11.1442 128 20.4184ZM117.84 20.4184C117.84 13.8609 113.805 9.05389 108.652 8.68067L104.553 35.7491C109.425 35.2616 117.84 28.5939 117.84 20.4184Z" fill="currentColor" fillOpacity="0.7"/>
          <path d="M77.4069 0.838623H70.1939C69.0573 0.838623 68.1006 1.73495 67.9254 2.87158L59.2344 40.0179H68.2163L77.4069 0.838623Z" fill="currentColor"/>
        </svg>
    );
}

export function PricingCard({ plan }: PricingCardProps) {
  return (
    <Card
      className={cn(
        "relative w-full max-w-sm shrink-0 snap-center overflow-hidden rounded-xl aspect-[1.586] text-white", // Aspect ratio for credit card
        "bg-gradient-to-br from-neutral-800 to-neutral-900 transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-primary/20",
        !!plan.popular && "border-2 border-primary shadow-lg shadow-primary/20"
      )}
    >
        {!!plan.popular && (
            <div className="absolute top-3 right-3 bg-primary text-primary-foreground py-1 px-2.5 text-xs font-bold text-center rounded-full z-10 shadow-lg">
                POPULAR
            </div>
        )}

      <CardContent className="relative flex flex-col justify-between h-full p-5">
        <div className="absolute inset-0 z-0 opacity-[.05]">
          <div className="absolute -top-1/2 -right-1/3 w-80 h-80 rounded-full bg-primary/50 blur-3xl"></div>
          <div className="absolute -bottom-1/2 -left-1/3 w-80 h-80 rounded-full bg-accent/50 blur-3xl"></div>
        </div>
        
        {/* Card Header */}
        <div className="z-10 flex justify-between items-start">
          <Zap className="h-8 w-8 text-primary" />
          <VisaLogo />
        </div>

        {/* Card Number (Data) */}
        <div className="z-10 text-center">
            <p className="font-mono text-2xl tracking-widest text-white/90">{plan.data}</p>
        </div>

        {/* Card Footer */}
        <div className="z-10 space-y-3">
             <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <p className="text-xs font-light text-white/60">Plan</p>
                    <p className="font-medium tracking-wide">{plan.title}</p>
                </div>
                <div>
                     <span className="text-xl font-bold">{plan.price}</span>
                     <span className="ml-1 text-sm text-white/60">{plan.period}</span>
                </div>
            </div>
            <Button asChild size="lg" className="w-full" variant={!!plan.popular ? 'default' : 'outline'}>
                <Link href="/login">Choose Plan</Link>
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
