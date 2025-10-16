'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import Link from 'next/link';
import type { PricingPlan } from '@/lib/types';

interface PricingCardProps {
  plan: PricingPlan;
}

export function PricingCard({ plan }: PricingCardProps) {
  return (
    <div className="w-full max-w-sm">
      <Card className="relative flex flex-col h-full border transition-all duration-300 ease-in-out hover:scale-105 hover:-translate-y-2">
        {plan.popular && (
          <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground py-1.5 text-sm font-bold text-center">
            Most Popular
          </div>
        )}
        
        <CardHeader className={`items-center text-center ${plan.popular ? 'pt-12' : 'pt-8'}`}>
          <CardTitle className="text-3xl font-headline tracking-tight">
            {plan.title}
          </CardTitle>
          <div className="flex items-baseline mt-2">
            <span className="text-5xl font-bold tracking-tighter">{plan.price}</span>
            <span className="ml-1 text-muted-foreground">{plan.period}</span>
          </div>
        </CardHeader>

        <CardContent className="flex-1 px-8 space-y-6">
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-4">
              <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
              <span className="flex-1 text-left">{plan.duration}</span>
            </div>
            <div className="flex items-center gap-4">
              <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
              <span className="flex-1 text-left">{plan.data} Traffic (Upload + Download)</span>
            </div>
            <div className="flex items-center gap-4">
              <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
              <span className="flex-1 text-left">{plan.devices}</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-6 pt-2">
          <Button 
            asChild 
            size="lg" 
            className="w-full" 
            variant={plan.popular ? 'default' : 'outline'}
          >
            <Link href="/login">Choose Plan</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
