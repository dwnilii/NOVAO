'use client';

import { useEffect, useState } from 'react';
import { getPricingPlans } from '@/lib/api';
import type { PricingPlan } from '@/lib/types';
import { Skeleton } from './ui/skeleton';
import { PricingCard } from './pricing-card';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

function PricingCardSkeleton() {
    return (
        <div className="w-full max-w-sm">
            <Card className="flex flex-col rounded-xl overflow-hidden h-full">
                <CardHeader className="items-center text-center pt-8">
                    <Skeleton className="h-8 w-24 mb-2" />
                    <Skeleton className="h-12 w-32 mb-1" />
                    <Skeleton className="h-4 w-20" />
                </CardHeader>
                <CardContent className="flex-1 px-8 space-y-2">
                    {[...Array(3)].map((_, i) => (
                       <Skeleton key={i} className="h-5 w-full" />
                    ))}
                </CardContent>
                <CardFooter className="p-6 pt-2">
                    <Skeleton className="h-11 w-full" />
                </CardFooter>
            </Card>
        </div>
    )
}

export function PricingSection() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPlans() {
      setIsLoading(true);
      try {
        const fetchedPlans = await getPricingPlans();
        // **Robust Filtering:** Ensure only valid, visible objects are processed.
        const cleanPlans = (Array.isArray(fetchedPlans) ? fetchedPlans : [])
            .filter(p => p && typeof p === 'object' && p.showOnLanding);
        setPlans(cleanPlans);
      } catch (error) {
        console.error("Failed to fetch pricing plans:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadPlans();
  }, []);

  if (isLoading) {
    return (
        <section id="pricing" className="py-20">
            <div className="container mx-auto px-4">
                <div className="mb-12 text-center">
                    <h2 className="text-4xl font-bold">Flexible Plans</h2>
                    <p className="mt-2 text-lg text-muted-foreground">
                        Choose a plan that works for you.
                    </p>
                </div>
                <div className="flex flex-wrap justify-center gap-8">
                   <PricingCardSkeleton />
                   <PricingCardSkeleton />
                   <PricingCardSkeleton />
                </div>
            </div>
        </section>
    );
  }

  if (plans.length === 0) {
    return null; // Don't render the section if there are no plans to show
  }

  return (
    <section id="pricing" className="py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold">Flexible Plans</h2>
          <p className="mt-2 text-lg text-muted-foreground">
            Choose a plan that works for you.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          {plans.map((plan) => (
            <PricingCard key={`plan-${plan.id}`} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  );
}
