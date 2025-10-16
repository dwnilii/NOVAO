'use client';

import { useState, useContext, useEffect } from 'react';
import type { Order } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from './ui/card';
import { LanguageContext } from '@/context/language-context';
import { translations, getTomanRate } from '@/lib/translations';

interface OrderHistoryDialogProps {
  userOrders: Order[];
  children: React.ReactNode;
}

export function OrderHistoryDialog({ userOrders, children }: OrderHistoryDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { language } = useContext(LanguageContext);
  const t = translations[language].orderHistory;
  const [tomanRate, setTomanRate] = useState(60000);

  useEffect(() => {
    if (language === 'fa' && isOpen) {
      getTomanRate().then(setTomanRate);
    }
  }, [language, isOpen]);

  const getStatusVariant = (status: Order['status']) => {
    switch (status) {
      case 'completed': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  const formatDisplayDate = (dateString: string) => {
    return new Intl.DateTimeFormat(language === 'fa' ? 'fa-IR-u-nu-latn' : 'en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(dateString));
  }

  const formatDisplayPrice = (amount: number) => {
      if (language === 'fa') {
          return `${(amount * tomanRate).toLocaleString('fa-IR')} تومان`;
      }
      return `$${amount.toFixed(2)}`;
  }


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t.title}</DialogTitle>
          <DialogDescription>{t.description}</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <ScrollArea className="h-[60vh] pr-4">
            {userOrders && userOrders.length > 0 ? (
              <>
                {/* Mobile View */}
                <div className="space-y-4 md:hidden">
                  {userOrders.map((order) => (
                    <Card key={order.id} className="bg-muted/40">
                      <CardContent className="p-4 space-y-2">
                        <div className="flex justify-between items-start">
                           <div>
                                <span className="font-mono text-xs text-muted-foreground">#{order.id.slice(-6)}</span>
                                {order.items.map(item => item.recipientUsername && (
                                    <p key={item.id} className="text-xs text-primary font-medium">{t.recipient.replace('{username}', item.recipientUsername)}</p>
                                ))}
                           </div>
                          <Badge variant={getStatusVariant(order.status)} className="capitalize">{t.statuses[order.status]}</Badge>
                        </div>
                        <div className="text-sm">
                          <p><strong>{t.date}:</strong> {formatDisplayDate(order.date)}</p>
                          <p><strong>{t.total}:</strong> {formatDisplayPrice(order.totalAmount as number)}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {/* Desktop View */}
                <Table className="hidden md:table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.orderId}</TableHead>
                      <TableHead>{t.date}</TableHead>
                      <TableHead>{t.total}</TableHead>
                      <TableHead>{t.status}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                            <div className='flex flex-col'>
                                <span className="font-mono text-xs">#{order.id.slice(-6)}</span>
                                {order.items.map(item => item.recipientUsername && (
                                     <span key={item.id} className="text-xs text-primary font-medium">{t.recipient.replace('{username}', item.recipientUsername)}</span>
                                ))}
                            </div>
                        </TableCell>
                        <TableCell>{formatDisplayDate(order.date)}</TableCell>
                        <TableCell>{formatDisplayPrice(order.totalAmount as number)}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(order.status)} className="capitalize">{t.statuses[order.status]}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            ) : (
                <div className="flex h-full items-center justify-center rounded-md border border-dashed py-24">
                    <p className="text-muted-foreground">{t.noOrders}</p>
                </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
