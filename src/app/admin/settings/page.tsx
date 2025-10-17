'use client';

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, Save, Zap } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { LandingPageSettings } from "@/components/landing-page-settings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TelegramSettings } from "@/components/telegram-settings";
import { PaymentSettings } from "@/components/payment-settings";
import { FeaturesSettings } from "@/components/features-settings";
import { ClientLinksSettings } from "@/components/client-links-settings";
import { getSetting, updateSetting } from "@/lib/api";
import Image from "next/image";
import { SiteLogo } from "@/components/site-logo";

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  // State for Branding
  const [siteName, setSiteName] = useState("Novao");
  const [isBrandingSaving, setIsBrandingSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

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
  
  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!['image/svg+xml', 'image/png', 'image/jpeg'].includes(file.type)) {
        toast({ title: "Invalid File Type", description: "Please upload an SVG, PNG, or JPG file.", variant: "destructive" });
        return;
    }

    setLogoPreview(URL.createObjectURL(file));
    setIsUploading(true);

    try {
        const formData = new FormData();
        formData.append('logo', file);
        const response = await fetch('/api/logo', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to upload logo.");
        }
        
        toast({
            title: "Logo Uploaded Successfully",
            description: "Your new logo has been saved. Please refresh to see changes across the site.",
        });
    } catch(e: any) {
        toast({
            title: "Error Uploading Logo",
            description: e.message || "Could not upload the new logo.",
            variant: "destructive",
        });
        setLogoPreview(null);
    } finally {
        setIsUploading(false);
        if (logoInputRef.current) {
            logoInputRef.current.value = "";
        }
    }
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="landing-page">Landing Page</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
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
                      <div className="flex items-center gap-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg border bg-muted">
                           <SiteLogo className="text-primary-foreground" iconClassName="h-6 w-6 text-muted-foreground" width={28} height={28}/>
                        </div>
                         {logoPreview && (
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg border bg-muted p-1">
                                <Image src={logoPreview} alt="New Logo Preview" width={40} height={40} className="object-contain w-full h-full" />
                            </div>
                        )}
                        <input type="file" ref={logoInputRef} onChange={handleLogoUpload} className="hidden" accept="image/svg+xml, image/png, image/jpeg" />
                        <Button variant="outline" onClick={() => logoInputRef.current?.click()} disabled={isUploading}>
                          {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                          Change Logo
                        </Button>
                      </div>
                       <p className="text-xs text-muted-foreground pt-1">Upload an SVG, PNG, or JPG file. Recommended size: 64x64 pixels.</p>
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
