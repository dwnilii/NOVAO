'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { getFeatures } from '@/lib/api';
import type { Feature } from '@/lib/types';
import * as LucideIcons from 'lucide-react';

export function FeaturesSection() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadFeatures() {
      try {
        setIsLoading(true);
        const fetchedFeatures = await getFeatures();
        setFeatures(fetchedFeatures);
      } catch (error) {
        console.error("Failed to fetch features:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadFeatures();
  }, []);

  const renderIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    if (IconComponent) {
      return <IconComponent className="h-8 w-8 text-primary" />;
    }
    // Fallback icon if the specified one doesn't exist
    return <LucideIcons.Star className="h-8 w-8 text-primary" />;
  };

  if (isLoading) {
    return (
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-4xl font-bold">Why Choose Novao?</h2>
            <p className="mt-2 text-lg text-muted-foreground">
              Experience the next generation of private connection services.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
             {[...Array(4)].map((_, i) => (
                <Card key={i} className="flex flex-col items-center p-6 text-center animate-pulse">
                  <div className="mb-4 h-8 w-8 rounded-full bg-muted"></div>
                  <div className="mb-2 h-6 w-3/4 rounded bg-muted"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-full rounded bg-muted"></div>
                    <div className="h-4 w-5/6 rounded bg-muted"></div>
                  </div>
                </Card>
             ))}
          </div>
        </div>
      </section>
    );
  }
  
  if (features.length === 0) {
      return null; // Don't render the section if there are no features
  }

  return (
    <section id="features" className="py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold">Why Choose Novao?</h2>
          <p className="mt-2 text-lg text-muted-foreground">
            Experience the next generation of private connection services.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.id} className="flex flex-col items-center p-6 text-center">
              <div className="mb-4">{renderIcon(feature.icon)}</div>
              <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
