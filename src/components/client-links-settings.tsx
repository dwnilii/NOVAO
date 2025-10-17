'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { getSetting, updateSetting } from '@/lib/api';
import { Loader2, Save } from 'lucide-react';
import { FaAndroid, FaWindows, FaApple } from "react-icons/fa";

const formSchema = z.object({
  android: z.string().url().or(z.literal('')),
  windows: z.string().url().or(z.literal('')),
  ios: z.string().url().or(z.literal('')),
  macos: z.string().url().or(z.literal('')),
});

export function ClientLinksSettings() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      android: '',
      windows: '',
      ios: '',
      macos: '',
    },
  });

  useEffect(() => {
    async function fetchSettings() {
        form.formState.isSubmitting; 
        const [android, windows, ios, macos] = await Promise.all([
            getSetting('clientLink_android'),
            getSetting('clientLink_windows'),
            getSetting('clientLink_ios'),
            getSetting('clientLink_macos'),
        ]);
        form.reset({
            android: android || '',
            windows: windows || '',
            ios: ios || '',
            macos: macos || '',
        });
    }
    fetchSettings();
  }, [form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
        await Promise.all([
            updateSetting('clientLink_android', values.android),
            updateSetting('clientLink_windows', values.windows),
            updateSetting('clientLink_ios', values.ios),
            updateSetting('clientLink_macos', values.macos),
        ]);
        toast({
            title: 'Client Links Saved',
            description: 'The download links for client applications have been updated.',
        });
    } catch (error) {
         toast({
            title: 'Error',
            description: 'Could not save client link settings.',
            variant: 'destructive'
        });
    }
  };

  const fields: {name: keyof z.infer<typeof formSchema>, label: string, icon: React.ReactNode}[] = [
    { name: 'android', label: 'Android Link', icon: <FaAndroid/> },
    { name: 'windows', label: 'Windows Link', icon: <FaWindows/> },
    { name: 'ios', label: 'iOS Link', icon: <FaApple/> },
    { name: 'macos', label: 'macOS Link', icon: <FaApple/> },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Client Application Links</CardTitle>
        <CardDescription>Provide direct download links for the client applications for different platforms.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {fields.map(fieldInfo => (
                    <FormField
                      key={fieldInfo.name}
                      control={form.control}
                      name={fieldInfo.name}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">{fieldInfo.icon} {fieldInfo.label}</FormLabel>
                          <FormControl>
                            <Input placeholder="https://..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                ))}
            </div>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />}
              Save Client Links
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
