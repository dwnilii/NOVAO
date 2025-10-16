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
import { Separator } from './ui/separator';
import { Loader2, Save } from 'lucide-react';

const formSchema = z.object({
  cardHolder: z.string().min(1, 'Card holder name is required.'),
  cardNumber: z.string().min(16, 'Card number must be 16 digits.').max(16, 'Card number must be 16 digits.'),
  tomanRate: z.coerce.number().min(1, 'Toman rate is required.'),
});

export function PaymentSettings() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cardHolder: '',
      cardNumber: '',
      tomanRate: 0,
    },
  });

  useEffect(() => {
    async function fetchSettings() {
        form.formState.isSubmitting; // Keep track of loading state
        const [cardHolder, cardNumber, tomanRate] = await Promise.all([
            getSetting('cardHolder'),
            getSetting('cardNumber'),
            getSetting('tomanRate')
        ]);
        form.reset({
            cardHolder: cardHolder || '',
            cardNumber: cardNumber || '',
            tomanRate: Number(tomanRate) || 60000,
        });
    }
    fetchSettings();
  }, [form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
        await Promise.all([
            updateSetting('cardHolder', values.cardHolder),
            updateSetting('cardNumber', values.cardNumber),
            updateSetting('tomanRate', String(values.tomanRate)),
        ]);
        toast({
            title: 'Payment Settings Saved',
            description: 'Your payment details and exchange rate have been updated.',
        });
    } catch (error) {
         toast({
            title: 'Error',
            description: 'Could not save payment settings.',
            variant: 'destructive'
        });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment & Currency</CardTitle>
        <CardDescription>Manage payment methods and currency conversion rates.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className='space-y-4'>
                <h3 className='font-medium text-lg'>Currency Conversion</h3>
                 <FormField
                  control={form.control}
                  name="tomanRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Toman Exchange Rate (per 1 USD)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 60000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            
            <Separator />

             <div className='space-y-4'>
                 <h3 className='font-medium text-lg'>Manual Payment Details</h3>
                <FormField
                  control={form.control}
                  name="cardHolder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Card Holder Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cardNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Card Number</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="**** **** **** ****" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
             </div>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />}
              Save Settings
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
