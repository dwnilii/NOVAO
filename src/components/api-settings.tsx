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
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Terminal, Loader2 } from 'lucide-react';
import { loginToPanel } from '@/app/admin-login/actions';
import { getSetting, updateSetting } from '@/lib/api';

const formSchema = z.object({
  panelUrl: z.string().url({ message: 'Please enter a valid URL.' }),
  username: z.string().min(1, 'Username is required.'),
  password: z.string().min(1, 'Password is required.'),
});

export function ApiSettings() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      panelUrl: '',
      username: '',
      password: '',
    },
  });

  useEffect(() => {
    async function fetchApiSettings() {
      const url = await getSetting('panelUrl');
      form.setValue('panelUrl', url || '');
    }
    fetchApiSettings();
  }, [form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    form.clearErrors();

    try {
      // First, try to log in to the panel to verify credentials
      const result = await loginToPanel(values.panelUrl, values.username, values.password);
      if (!result.success) {
        throw new Error(result.message);
      }

      // If login is successful, save the URL to the database for server-side use
      await updateSetting('panelUrl', values.panelUrl);
      
      toast({
        title: 'API Connection Successful',
        description: 'Session cookie has been saved and Panel URL is stored for server use.',
      });
      // Optionally clear password field after successful submission
      form.setValue('password', '');
    } catch (error: any) {
      toast({
        title: 'API Connection Failed',
        description: error.message || 'An unknown error occurred.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>3x-ui API Connection</CardTitle>
        <CardDescription>
          Configure the connection to your 3x-ui panel to enable live data synchronization.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>One-Time Setup (Per Browser)</AlertTitle>
          <AlertDescription>
            This action saves a session cookie in your browser for API communication and stores the Panel URL in the database for server-side use.
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="panelUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Panel URL</FormLabel>
                  <FormControl>
                    <Input placeholder="http://127.0.0.1:2053" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Panel Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Panel admin username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Panel Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect to API & Save Settings'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
