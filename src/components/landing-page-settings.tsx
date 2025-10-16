'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getSetting, updateSetting } from '@/lib/api';

export function LandingPageSettings() {
  const { toast } = useToast();

  const [showFeatures, setShowFeatures] = useState(true);
  const [showPricing, setShowPricing] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      setIsLoading(true);
      try {
        const [featuresVisible, pricingVisible] = await Promise.all([
          getSetting('landing_showFeatures'),
          getSetting('landing_showPricing'),
        ]);
        
        setShowFeatures(featuresVisible !== 'false');
        setShowPricing(pricingVisible !== 'false');
      } catch (error) {
        toast({ title: "Error", description: "Could not load landing page settings.", variant: "destructive"});
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, [toast]);


  const handleSettingsSave = async () => {
    try {
      await Promise.all([
        updateSetting('landing_showFeatures', String(showFeatures)),
        updateSetting('landing_showPricing', String(showPricing)),
      ]);
      toast({
        title: 'Landing Page Settings Saved',
        description: 'Your changes have been saved to the database.',
      });
    } catch(error) {
       toast({
        title: 'Error Saving Settings',
        description: 'Could not save landing page visibility settings.',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Landing Page Sections</CardTitle>
          <CardDescription>Control which sections are visible on your main landing page.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="features-section" className="text-base">Features Section</Label>
              <p className="text-sm text-muted-foreground">Show the "Why Choose Novao?" section.</p>
            </div>
            <Switch
              id="features-section"
              checked={showFeatures}
              onCheckedChange={setShowFeatures}
              disabled={isLoading}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="pricing-section" className="text-base">Pricing Section</Label>
              <p className="text-sm text-muted-foreground">Show the "Flexible Plans" pricing section.</p>
            </div>
            <Switch
              id="pricing-section"
              checked={showPricing}
              onCheckedChange={setShowPricing}
              disabled={isLoading}
            />
          </div>
           <Button onClick={handleSettingsSave} className="w-full lg:w-auto mt-4">Save Visibility Settings</Button>
        </CardContent>
      </Card>
    </>
  );
}
