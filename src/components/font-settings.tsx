'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, Loader2, Trash2 } from 'lucide-react';
import { getSetting, updateSetting } from '@/lib/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface FontFile {
  name: string;
  path: string;
  type: 'persian' | 'english';
}

export function FontSettings() {
  const [isUploading, setIsUploading] = useState(false);
  const [currentFonts, setCurrentFonts] = useState<FontFile[]>([]);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCurrentFonts();
  }, []);

  const loadCurrentFonts = async () => {
    try {
      setIsLoading(true);
      const persianFontsStr = await getSetting('persian_fonts');
      const englishFontsStr = await getSetting('english_fonts');
      
      const persianFonts = persianFontsStr ? JSON.parse(persianFontsStr) : [];
      const englishFonts = englishFontsStr ? JSON.parse(englishFontsStr) : [];
      
      setCurrentFonts([...persianFonts, ...englishFonts]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load font settings",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFontUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'persian' | 'english') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.name.toLowerCase().endsWith('.ttf') && !file.name.toLowerCase().endsWith('.woff2')) {
      toast({
        title: "Error",
        description: "Please upload only TTF or WOFF2 font files",
        variant: "destructive"
      });
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size should not exceed 5MB",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('font', file);
      formData.append('type', type);

      const response = await fetch('/api/fonts/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Failed to upload font');

      const { path } = await response.json();
      
      // Update the fonts list
      const newFont: FontFile = {
        name: file.name,
        path: path,
        type: type
      };

      const updatedFonts = [...currentFonts, newFont];
      setCurrentFonts(updatedFonts);

      // Update settings
      const persianFonts = updatedFonts.filter(f => f.type === 'persian');
      const englishFonts = updatedFonts.filter(f => f.type === 'english');
      
      await updateSetting('persian_fonts', JSON.stringify(persianFonts));
      await updateSetting('english_fonts', JSON.stringify(englishFonts));

      toast({
        title: "Success",
        description: "Font has been uploaded successfully"
      });
      
      loadCurrentFonts(); // Refresh the list
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload font",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFont = async (fontPath: string, type: 'persian' | 'english') => {
    try {
      const response = await fetch('/api/fonts/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path: fontPath }),
      });

      if (!response.ok) throw new Error('Failed to delete font');

      // Update the fonts list
      const updatedFonts = currentFonts.filter(f => f.path !== fontPath);
      setCurrentFonts(updatedFonts);

      // Update settings
      const persianFonts = updatedFonts.filter(f => f.type === 'persian');
      const englishFonts = updatedFonts.filter(f => f.type === 'english');
      
      await updateSetting('persian_fonts', JSON.stringify(persianFonts));
      await updateSetting('english_fonts', JSON.stringify(englishFonts));

      toast({
        title: "Success",
        description: "Font has been deleted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete font",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Font Settings</CardTitle>
        <CardDescription>Manage Persian and English fonts for your site</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Persian Fonts Upload */}
          <div className="space-y-2">
            <Label htmlFor="persian-font-upload">Upload Persian Font</Label>
            <div className="grid w-full items-center gap-4">
              <Input
                id="persian-font-upload"
                type="file"
                accept=".ttf,.woff2"
                onChange={(e) => handleFontUpload(e, 'persian')}
                disabled={isUploading}
              />
            </div>
          </div>

          {/* English Fonts Upload */}
          <div className="space-y-2">
            <Label htmlFor="english-font-upload">Upload English Font</Label>
            <div className="grid w-full items-center gap-4">
              <Input
                id="english-font-upload"
                type="file"
                accept=".ttf,.woff2"
                onChange={(e) => handleFontUpload(e, 'english')}
                disabled={isUploading}
              />
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Accepted formats: TTF, WOFF2 - Max size: 5MB
        </p>

        {/* Current Fonts Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Font Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Path</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                </TableCell>
              </TableRow>
            ) : currentFonts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No fonts uploaded yet
                </TableCell>
              </TableRow>
            ) : (
              currentFonts.map((font, index) => (
                <TableRow key={index}>
                  <TableCell>{font.name}</TableCell>
                  <TableCell>{font.type === 'persian' ? 'Persian' : 'English'}</TableCell>
                  <TableCell>
                    <code className="rounded bg-muted px-2 py-1">{font.path}</code>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteFont(font.path, font.type)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="space-y-2 mt-4">
          <Label>Manual Font Installation</Label>
          <p className="text-sm text-muted-foreground">
            To manually install fonts, place the font files in:
            <code className="mx-1 rounded bg-muted px-2 py-1">public/fonts/</code>
            directory and update the settings accordingly.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
