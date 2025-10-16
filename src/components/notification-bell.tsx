'use client';

import { useState, useEffect, useContext, useMemo } from 'react';
import { Bell, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import type { Order } from '@/lib/types';
import { LanguageContext } from '@/context/language-context';
import { translations } from '@/lib/translations';
import { useAuth } from '@/hooks/use-auth';

interface NotificationBellProps {
    allOrders: Order[];
    isLoading: boolean;
}

export function NotificationBell({ allOrders, isLoading }: NotificationBellProps) {
  const { language } = useContext(LanguageContext);
  const t = translations[language].orderHistory;
  const { user } = useAuth();
  
  const [hasPendingOrders, setHasPendingOrders] = useState(false);

  const userOrders = useMemo(() => {
    if (!user) return [];
    return allOrders.filter(order => order.user_id === user.id);
  }, [allOrders, user]);

  useEffect(() => {
    // Check if there are any orders with 'pending' status
    const pending = userOrders.some(order => order.status === 'pending');
    setHasPendingOrders(pending);
  }, [userOrders]);
  
  const getStatusVariant = (status: Order['status']) => {
    switch (status) {
      case 'completed': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {hasPendingOrders && (
            <span className="absolute top-2 right-2 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          )}
          <span className="sr-only">Open notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="p-4">
          <h4 className="font-medium leading-none">{t.title}</h4>
        </div>
        <div className="grid gap-2 p-4 pt-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-24">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : userOrders.length > 0 ? (
            userOrders.slice(0, 5).map(order => (
              <div
                key={order.id}
                className="mb-2 grid grid-cols-[25px_1fr] items-start last:mb-0 last:pb-0"
              >
                <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                     <p className="text-sm font-medium leading-none">
                        Order #{order.id.slice(-6)}
                     </p>
                     <Badge variant={getStatusVariant(order.status)} className="capitalize text-xs">{t.statuses[order.status]}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">{t.noOrders}</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
