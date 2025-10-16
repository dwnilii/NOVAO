'use client';

import { useEffect, useState } from 'react';
import { getPricingPlans } from '@/lib/api';
import type { PricingPlan } from '@/lib/types';
import { Skeleton } from './ui/skeleton';
import { PricingCard } from './pricing-card';
import { Card } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

function PricingCardSkeleton() {
    return (
        <Card className="w-full max-w-sm shrink-0 h-[450px]">
            <div className="flex flex-col justify-between h-full p-6">
                 <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-6 w-6 rounded-full" />
                    </div>
                    <Skeleton className="h-12 w-32" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-3">
                     <Skeleton className="h-5 w-3/4" />
                     <Skeleton className="h-5 w-1/2" />
                </div>
                <Skeleton className="h-12 w-full" />
            </div>
        </Card>
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
                 <div className="flex justify-center gap-8">
                   <PricingCardSkeleton />
                </div>
            </div>
        </section>
    );
  }

  if (plans.length === 0) {
    return null; 
  }

  return (
    <section id="pricing" className="py-20">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-bold">Flexible Plans</h2>
          <p className="mt-2 text-lg text-muted-foreground">
            Choose a plan that works for you.
          </p>
        </div>
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full max-w-md mx-auto"
        >
          <CarouselContent>
            {plans.map((plan) => (
              <CarouselItem key={`plan-${plan.id}`} className="flex justify-center">
                <PricingCard plan={plan} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:inline-flex" />
          <CarouselNext className="hidden sm:inline-flex" />
        </Carousel>
      </div>
    </section>
  );
}
