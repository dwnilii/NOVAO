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
import { Terminal, Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import { getSetting, updateSetting } from '@/lib/api';

const formSchema = z.object({
  botToken: z.string().min(1, 'Bot Token is required.'),
  chatId: z.string().min(1, 'Chat ID is required.'),
  proxy: z.string().optional(),
});

export function TelegramSettings() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      botToken: '',
      chatId: '',
      proxy: '',
    },
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const [botToken, chatId, proxy] = await Promise.all([
          getSetting('telegramBotToken'),
          getSetting('telegramChatId'),
          getSetting('telegramProxy'),
        ]);
        form.reset({
          botToken: botToken || '',
          chatId: chatId || '',
          proxy: proxy || '',
        });
      } catch (error) {
        toast({ title: 'Error', description: 'Could not fetch Telegram settings.', variant: 'destructive' });
      }
    }
    fetchSettings();
  }, [form, toast]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await Promise.all([
        updateSetting('telegramBotToken', values.botToken),
        updateSetting('telegramChatId', values.chatId),
        updateSetting('telegramProxy', values.proxy || ''),
      ]);
      toast({
        title: 'Telegram Settings Saved',
        description: 'Your notification settings have been updated.',
      });
    } catch (error) {
      toast({ title: 'Error', description: 'Could not save Telegram settings.', variant: 'destructive' });
    }
  };

  const handleTestNotification = () => {
     // This would trigger a server-side function to send a test message.
    toast({
      title: 'Test Notification Sent',
      description: 'Check your Telegram for a test message. (Simulation)',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Telegram Notifications</CardTitle>
        <CardDescription>Receive new order notifications directly in Telegram.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>How to get your credentials</AlertTitle>
          <AlertDescription>
            Talk to <Link href="https://t.me/BotFather" target="_blank" className="font-medium text-primary hover:underline">@BotFather</Link> to create a bot and get your token. Then, get your Chat ID from a bot like <Link href="https://t.me/userinfobot" target="_blank" className="font-medium text-primary hover:underline">@userinfobot</Link>.
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="botToken"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bot Token</FormLabel>
                  <FormControl>
                    <Input placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="chatId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Chat ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Your personal or group chat ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="proxy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SOCKS5 Proxy (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="socks5://user:pass@host:port" {...field} />
                  </FormControl>
                   <p className="text-xs text-muted-foreground pt-1">Required if Telegram is blocked in your server's region.</p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-2">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />}
                  Save Settings
                </Button>
                <Button type="button" variant="outline" onClick={handleTestNotification}>Send Test Notification</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
