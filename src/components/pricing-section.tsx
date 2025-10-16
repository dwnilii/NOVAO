'use client';

import { useEffect, useState } from 'react';
import type { CarouselApi } from "@/components/ui/carousel"
import { getPricingPlans } from '@/lib/api';
import type { PricingPlan } from '@/lib/types';
import { Skeleton } from './ui/skeleton';
import { PricingCard } from './pricing-card';
import { Card } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

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

function CarouselDots({ api, count }: { api: CarouselApi, count: number }) {
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
        if (!api) return;

        const onSelect = () => {
            setSelectedIndex(api.selectedScrollSnap());
        };

        api.on("select", onSelect);
        onSelect(); // Set initial state

        return () => {
            api.off("select", onSelect);
        };
    }, [api]);

    if (count <= 1) return null;

    return (
        <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: count }).map((_, index) => (
                <Button
                    key={index}
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "h-2 w-2 rounded-full p-0 transition-all",
                        "bg-muted hover:bg-muted-foreground/80",
                        selectedIndex === index && "w-4 bg-primary hover:bg-primary/80"
                    )}
                    onClick={() => api?.scrollTo(index)}
                />
            ))}
        </div>
    );
}

export function PricingSection() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [api, setApi] = useState<CarouselApi>()

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
          setApi={setApi}
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
          <CarouselPrevious className="sm:inline-flex -left-4 sm:-left-12" />
          <CarouselNext className="sm:inline-flex -right-4 sm:-right-12" />
        </Carousel>
        {api && <CarouselDots api={api} count={plans.length} />}
      </div>
    </section>
  );
}
