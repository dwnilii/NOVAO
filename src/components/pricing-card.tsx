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
            
            <div className="z-10 flex justify-between items-start">
              <Zap className="h-8 w-8 text-primary" />
               <Button variant="ghost" size="icon" className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10" onClick={() => setIsFlipped(true)}>
                  <Info className="h-5 w-5" />
               </Button>
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
        
        {/* Back of the card */}
        <Card
          className={cn(
            "absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] text-white",
            "bg-gradient-to-br from-neutral-900 to-neutral-700 ring-1 ring-inset ring-white/10"
          )}
        >
          <CardContent className="relative flex flex-col h-full p-5">
            <div className="z-10 flex justify-between items-start">
              <h3 className="font-bold text-lg">{plan.title} - Details</h3>
               <Button variant="ghost" size="icon" className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10" onClick={() => setIsFlipped(false)}>
                  <X className="h-5 w-5" />
               </Button>
            </div>
            <div className="z-10 flex-1 flex flex-col justify-center items-start text-sm space-y-2">
                <p><strong className='text-white/70'>Duration:</strong> {plan.duration}</p>
                <p><strong className='text-white/70'>Devices:</strong> {plan.devices}</p>
                {plan.features && plan.features.length > 0 && (
                    <div className='pt-2'>
                        <p className='font-bold text-white/70 mb-1'>Features:</p>
                        <ul className="list-disc list-inside space-y-1">
                           {plan.features.map((feature, index) => (
                                <li key={index}>{feature}</li>
                           ))}
                        </ul>
                    </div>
                )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
