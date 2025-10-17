'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, Save, Loader2 } from 'lucide-react';
import { getSetting, updateSetting } from '@/lib/api';

export function LogoSettings() {
  const [isUploading, setIsUploading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    loadCurrentLogo();
  }, []);

  const loadCurrentLogo = async () => {
    try {
      const currentLogo = await getSetting('current_logo');
      if (currentLogo) {
        setPreviewUrl(currentLogo);
      }
    } catch (error) {
      console.error('Failed to load current logo:', error);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please upload only image files.",
        variant: "destructive"
      });
      return;
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size should not exceed 2MB.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsUploading(true);
      setSelectedLogo(file);
      setPreviewUrl(URL.createObjectURL(file));
      toast({
        title: "Success",
        description: "Logo has been selected. Click Apply to save changes.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload logo.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleApplyLogo = async () => {
    if (!selectedLogo) return;

    try {
      setIsApplying(true);
      const formData = new FormData();
      formData.append('logo', selectedLogo);

      const response = await fetch('/api/logo/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Error uploading file');

      const { path } = await response.json();
      await updateSetting('current_logo', path);

      toast({
        title: "Success",
        description: "Logo has been updated and applied successfully.",
      });

      // Reset selection state
      setSelectedLogo(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to apply logo changes.",
        variant: "destructive"
      });
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Logo Settings</CardTitle>
        <CardDescription>Manage your site's logo</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="logo-upload">Upload New Logo</Label>
          <div className="grid w-full items-center gap-4">
            <Input
              id="logo-upload"
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              disabled={isUploading}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Accepted formats: PNG, JPG, SVG - Max size: 2MB
          </p>
        </div>

        {/* Logo Preview */}
        {previewUrl && (
          <div className="mt-4">
            <Label>Logo Preview</Label>
            <div className="mt-2 p-4 border rounded-lg">
              <img src={previewUrl} alt="Logo Preview" className="h-12 w-auto" />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-4 border-t mt-4">
          <Button
            variant="outline"
            onClick={() => {
              setSelectedLogo(null);
              setPreviewUrl('');
              loadCurrentLogo();
            }}
            disabled={!selectedLogo}
          >
            Cancel
          </Button>
          <Button
            onClick={handleApplyLogo}
            disabled={!selectedLogo || isApplying}
          >
            {isApplying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Applying...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Apply Logo
              </>
            )}
          </Button>
        </div>
        
        <div className="space-y-2 mt-4">
          <Label>Logo Storage Path</Label>
          <p className="text-sm text-muted-foreground">
            The logo will be stored at:
            <code className="mx-1 rounded bg-muted px-2 py-1">public/logo.svg</code>
          </p>
          <p className="text-sm text-muted-foreground">
            To manually update the logo, you can replace the file with the same name in this path.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
