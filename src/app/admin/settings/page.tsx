'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, Save } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { LandingPageSettings } from "@/components/landing-page-settings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TelegramSettings } from "@/components/telegram-settings";
import { PaymentSettings } from "@/components/payment-settings";
import { FeaturesSettings } from "@/components/features-settings";
import { ClientLinksSettings } from "@/components/client-links-settings";
import { getSetting, updateSetting } from "@/lib/api";

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  // State for Branding
  const [siteName, setSiteName] = useState("Novao");
  const [isBrandingSaving, setIsBrandingSaving] = useState(false);

  // State for Hero Section
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroButtonText, setHeroButtonText] = useState('');
  const [isHeroSaving, setIsHeroSaving] = useState(false);
  
   useEffect(() => {
    async function loadSettings() {
      setIsLoading(true);
      try {
        const [
          fetchedSiteName,
          title,
          subtitle,
          buttonText,
        ] = await Promise.all([
          getSetting('siteName'),
          getSetting('heroTitle'),
          getSetting('heroSubtitle'),
          getSetting('heroButtonText'),
        ]);
        setSiteName(fetchedSiteName || "Novao");
        setHeroTitle(title || "A Secure, Fast, and Reliable Private Service");
        setHeroSubtitle(subtitle || "Novao provides a seamless and secure internet experience, protecting your privacy without compromising on speed.");
        setHeroButtonText(buttonText || "Get Your Free Trial");
      } catch (error) {
        toast({ title: "Error", description: "Could not load page settings." });
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, [toast]);


  const handleBrandingSave = async () => {
    setIsBrandingSaving(true);
    try {
      await updateSetting('siteName', siteName);
      toast({
        title: "Branding Saved",
        description: "Your new site name has been saved.",
      });
    } catch(e) {
       toast({
        title: "Error Saving Branding",
        description: "Could not save the site name.",
        variant: "destructive",
      });
    } finally {
      setIsBrandingSaving(false);
    }
  };
  
  const handleLogoChange = () => {
    // Simulate file upload
     toast({
      title: "Logo Uploaded",
      description: "Your new logo has been uploaded successfully.",
    });
  };

  const handleHeroSave = async () => {
    setIsHeroSaving(true);
    try {
      await Promise.all([
        updateSetting('heroTitle', heroTitle),
        updateSetting('heroSubtitle', heroSubtitle),
        updateSetting('heroButtonText', heroButtonText),
      ]);
      toast({
        title: "Hero Content Saved",
        description: "The landing page hero has been updated.",
      });
    } catch (error) {
      toast({
        title: "Error Saving Hero",
        description: "Could not save the hero content.",
        variant: "destructive",
      });
    } finally {
      setIsHeroSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Site & Landing Page Settings</h1>
      
      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="landing-page">Landing Page</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="telegram">Telegram</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Branding</CardTitle>
                <CardDescription>Manage your site's name and logo.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoading ? <Loader2 className="animate-spin" /> : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="siteName">Site Name</Label>
                      <Input 
                        id="siteName" 
                        value={siteName}
                        onChange={(e) => setSiteName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Current Logo</Label>
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary-foreground"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
                        </div>
                        <Button variant="outline" onClick={handleLogoChange}>
                          <Upload className="mr-2 h-4 w-4" />
                          Change Logo
                        </Button>
                      </div>
                    </div>
                    <Button onClick={handleBrandingSave} disabled={isBrandingSaving}>
                      {isBrandingSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />}
                      Save Branding
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="landing-page" className="mt-6">
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Hero Section</CardTitle>
                <CardDescription>Edit the content of the main landing page hero.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoading ? <Loader2 className="animate-spin" /> : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="heroTitle">Title</Label>
                      <Input 
                        id="heroTitle" 
                        value={heroTitle}
                        onChange={(e) => setHeroTitle(e.target.value)} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="heroSubtitle">Subtitle</Label>
                      <Textarea 
                        id="heroSubtitle" 
                        value={heroSubtitle}
                        onChange={(e) => setHeroSubtitle(e.target.value)}
                        className="h-24"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="heroButton">Button Text</Label>
                      <Input 
                        id="heroButton" 
                        value={heroButtonText}
                        onChange={(e) => setHeroButtonText(e.target.value)} 
                      />
                    </div>
                    <Button onClick={handleHeroSave} disabled={isHeroSaving}>
                       {isHeroSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />}
                      Save Hero Content
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
            <FeaturesSettings />
            <LandingPageSettings />
          </div>
        </TabsContent>
         <TabsContent value="payment" className="mt-6">
          <PaymentSettings />
        </TabsContent>
        <TabsContent value="telegram" className="mt-6">
            <TelegramSettings />
        </TabsContent>
        <TabsContent value="clients" className="mt-6">
            <ClientLinksSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
