'use client';

import { useForm } from 'react-hook-form';
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
import { type User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import React from 'react';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Username must be at least 2 characters.' }),
  uuid: z.string().min(1, { message: 'Could not extract UUID from config.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  subscription: z.enum(['active', 'inactive', 'expired']),
  config: z.string().optional(),
  sublink: z.string().optional(),
});

type AddUserFormProps = {
  onUserAdd: (user: Omit<User, 'id' | 'registered' | 'usage' | 'total'> & { usage?: number, total?: number }) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AddUserForm({ onUserAdd, open, onOpenChange }: AddUserFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      uuid: '',
      password: '',
      subscription: 'active',
      config: '',
      sublink: '',
    },
  });
  
  const handleConfigChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    form.setValue('config', value);
    
    // Extracts UUID from vless:// or vmess:// links
    try {
      if (value.startsWith('vless://') || value.startsWith('vmess://')) {
        const atIndex = value.indexOf('@');
        const protocolIndex = value.indexOf('://') + 3;
        if (atIndex > protocolIndex) {
          const extractedUUID = value.substring(protocolIndex, atIndex);
          form.setValue('uuid', extractedUUID);
          form.clearErrors('uuid'); // Clear error if UUID is now valid
        }
      }
    } catch (error) {
      // Could be an invalid link format, do nothing, let validation handle it
      form.setValue('uuid', '');
    }
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    onUserAdd({ ...values, total: 100, usage: 0 }); // Default total/usage
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) form.reset();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Enter the details for the new portal user below. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Portal Username</FormLabel>
                  <FormControl>
                    <Input placeholder="john.doe" {...field} />
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
                  <FormLabel>Portal Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="config"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>V2Ray Config</FormLabel>
                  <FormControl>
                    <Textarea placeholder="vless://..." {...field} onChange={handleConfigChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             {/* UUID is hidden but its validation message will appear under the config field if needed */}
             <FormField
                control={form.control}
                name="uuid"
                render={({ field }) => (
                  <FormItem className="hidden">
                    <FormLabel>V2Ray Client UUID</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly />
                    </FormControl>
                     <FormMessage />
                  </FormItem>
                )}
              />
            <FormField
              control={form.control}
              name="sublink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subscription Link</FormLabel>
                  <FormControl>
                    <Textarea placeholder="https://your-domain/path-to/sub" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subscription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Panel Access</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Enabled</SelectItem>
                      <SelectItem value="inactive">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="submit">Save User</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
