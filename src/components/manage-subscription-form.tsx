'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type User, type PricingPlan } from '@/lib/types';
import { getPricingPlans } from '@/lib/api';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';


const formSchema = z.object({
  subscription: z.enum(['active', 'inactive', 'expired']),
  planId: z.string().optional(), // Corresponds to pricing plan ID
  usage: z.coerce.number().min(0, 'Usage must be a positive number.'),
  total: z.coerce.number().min(0, 'Total must be a positive number.'),
  expiryDate: z.date().optional(),
});

type ManageSubscriptionFormProps = {
  user: User;
  onUserUpdate: (user: User) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ManageSubscriptionForm({ user, onUserUpdate, open, onOpenChange }: ManageSubscriptionFormProps) {
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subscription: 'active',
      planId: '',
      usage: 0,
      total: 0,
      expiryDate: undefined,
    },
  });

   useEffect(() => {
    async function loadPlans() {
      if (open) {
        const plans = await getPricingPlans();
        setPricingPlans(plans);
      }
    }
    loadPlans();
  }, [open]);
  
  useEffect(() => {
    if (user && pricingPlans.length > 0) {
      const currentPlan = pricingPlans.find(p => p.title === user.planTitle);
      form.reset({
        subscription: user.subscription,
        planId: currentPlan?.id || '',
        usage: user.usage,
        total: user.total,
        expiryDate: user.expiryDate ? new Date(user.expiryDate) : undefined,
      });
    } else if (user) {
        form.reset({
        subscription: user.subscription,
        planId: '',
        usage: user.usage,
        total: user.total,
        expiryDate: user.expiryDate ? new Date(user.expiryDate) : undefined,
      });
    }
  }, [user, pricingPlans, form, open]);


  function onSubmit(values: z.infer<typeof formSchema>) {
    const selectedPlan = pricingPlans.find(p => p.id === values.planId);
    
    // Start with the existing user data
    const updatedUser: User = { ...user };

    // Apply form values
    updatedUser.subscription = values.subscription;
    updatedUser.usage = values.usage;
    updatedUser.total = values.total;
    updatedUser.expiryDate = values.expiryDate ? values.expiryDate.toISOString().split('T')[0] : undefined;

    // If a new plan was selected, override total and planTitle
    if (selectedPlan) {
      // Safely parse the integer value from a string like "100 GB"
      const planData = parseInt(selectedPlan.data.toString().split(' ')[0], 10);
      if (!isNaN(planData)) {
          updatedUser.total = planData;
      }
      updatedUser.planTitle = selectedPlan.title;
    }
    
    onUserUpdate(updatedUser);
  }

  const formatJalaliDate = (date: Date) => {
    return new Intl.DateTimeFormat('fa-IR-u-nu-latn', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manage Subscription: {user.name}</DialogTitle>
          <DialogDescription>
            Adjust the user's plan, data, and status.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="subscription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Status (on Server)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Enabled</SelectItem>
                      <SelectItem value="inactive">Disabled</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="planId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subscription Plan</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a plan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                       {pricingPlans.map(plan => (
                           <SelectItem key={plan.id} value={plan.id!}>{plan.title} ({plan.data})</SelectItem>
                       ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="usage"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Data Usage (GB)</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="e.g., 25" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                control={form.control}
                name="total"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Total Data (GB)</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="e.g., 100" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            
            <Controller
              control={form.control}
              name="expiryDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Service Expiration Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            formatJalaliDate(new Date(field.value))
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="mr-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <DayPicker
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />


            <DialogFooter>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
