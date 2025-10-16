'use client';

import { useState } from 'react';
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

const formSchema = z.object({
  panelUrl: z.string().url({ message: 'Please enter a valid URL.' }),
  username: z.string().min(1, 'Username is required.'),
  password: z.string().min(1, 'Password is required.'),
});

export function ApiSettings() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    // In a real app, you would fetch and pre-fill these values from a secure DB
    defaultValues: {
      panelUrl: '',
      username: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const result = await loginToPanel(values.panelUrl, values.username, values.password);
      if (result.success) {
        toast({
          title: 'API Login Successful',
          description: 'Session cookie has been saved. The app can now communicate with the panel.',
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({
        title: 'API Login Failed',
        description: error.message || 'An unknown error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
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
          <AlertTitle>One-Time Setup</AlertTitle>
          <AlertDescription>
            You only need to do this once per browser session. This will log into your panel and save the session cookie required for the API proxy to work.
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Login to API & Save Session'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
