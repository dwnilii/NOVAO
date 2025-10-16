'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';
import Link from 'next/link';
import type { PricingPlan } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Info, X } from 'lucide-react';
import { useState } from 'react';

export function PricingCard({ plan }: { plan: PricingPlan }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className={cn("group/card w-full max-w-sm shrink-0 snap-center aspect-[1.586] [perspective:1000px]")}>
       <div 
        className={cn(
          "relative h-full w-full rounded-xl shadow-lg [transform-style:preserve-3d] transition-transform duration-700",
          isFlipped && "[transform:rotateY(180deg)]"
        )}
      >
        {/* Front of the card */}
        <Card
          className={cn(
            "absolute inset-0 w-full h-full [backface-visibility:hidden] text-white transition-all duration-300 ease-in-out",
            "bg-gradient-to-br from-neutral-700 to-neutral-900 ring-1 ring-inset ring-white/10",
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
            
            <div className="z-10 flex justify-between items-start">
              <Zap className="h-8 w-8 text-primary" />
            </div>

            <div className="z-10 text-center">
                <p className="font-mono text-2xl tracking-widest text-white/90">{plan.data}</p>
            </div>

            <div className="z-10 space-y-3">
                 <div className="flex justify-between items-end">
                    <div className="space-y-1">
                        <p className="text-xs font-light text-white/60">Plan</p>
                        <p className="font-medium tracking-wide">{plan.title}</p>
                        <p className="text-xs font-light text-white/70">{plan.duration} / {plan.devices}</p>
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
      </div>
    </div>
  );
}
