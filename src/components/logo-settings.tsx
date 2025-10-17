'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload } from 'lucide-react';

export function LogoSettings() {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

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
      const formData = new FormData();
      formData.append('logo', file);

      const response = await fetch('/api/logo/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Error uploading file');

      toast({
        title: "Success",
        description: "Logo has been updated successfully.",
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
        
        <div className="space-y-2">
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
