'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Zap } from 'lucide-react';
import Link from 'next/link';
import type { PricingPlan } from '@/lib/types';
import { cn } from '@/lib/utils';

interface PricingCardProps {
  plan: PricingPlan;
}

export function PricingCard({ plan }: PricingCardProps) {
  return (
      <Card className={cn(
        "relative flex flex-col h-full w-full max-w-sm shrink-0 snap-center overflow-hidden rounded-xl",
        "bg-gradient-to-br from-neutral-900 to-neutral-800 text-foreground shadow-2xl transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-primary/20",
         plan.popular && "border-2 border-primary shadow-primary/20"
      )}>
         {plan.popular && (
          <div className="absolute top-4 right-4 bg-primary text-primary-foreground py-1 px-3 text-xs font-bold text-center rounded-full z-10">
            Most Popular
          </div>
        )}
        <CardContent className="relative flex flex-col justify-between flex-1 p-6">
            <div className="absolute inset-0 z-0 opacity-[.03]">
                <div className="absolute -top-1/2 -right-1/3 w-96 h-96 rounded-full bg-primary/50 blur-3xl"></div>
                <div className="absolute -bottom-1/2 -left-1/3 w-96 h-96 rounded-full bg-accent/50 blur-3xl"></div>
            </div>

            <div className="z-10">
                <div className="flex justify-between items-center mb-4">
                     <h3 className="text-2xl font-bold">{plan.title}</h3>
                     <Zap className="h-6 w-6 text-primary" />
                </div>
                 <div className="mb-6">
                    <span className="text-5xl font-bold">{plan.price}</span>
                    <span className="ml-1.5 text-lg text-muted-foreground">{plan.period}</span>
                 </div>
                 <div className="font-mono text-center text-xl tracking-widest bg-black/20 p-3 rounded-md border border-white/10">
                    {plan.data}
                 </div>
            </div>
            
             <div className="z-10 mt-6 space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>{plan.duration}</span>
                </div>
                 <div className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>{plan.devices}</span>
                </div>
             </div>

             <div className="z-10 mt-8">
                  <Button 
                    asChild 
                    size="lg" 
                    className="w-full" 
                    variant={plan.popular ? 'default' : 'outline'}
                >
                    <Link href="/login">Choose Plan</Link>
                </Button>
             </div>
        </CardContent>
      </Card>
  );
}
