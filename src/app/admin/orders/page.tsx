'use client';

import { useState, useEffect } from 'react';
import type { Order } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Check, X, Eye, Loader2, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { getOrders, updateOrderStatus, getSetting, deleteOrder } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [tomanRate, setTomanRate] = useState(60000);
  const { toast } = useToast();

  useEffect(() => {
    async function loadInitialData() {
      try {
        setIsLoading(true);
        const [fetchedOrders, rate] = await Promise.all([
          getOrders(),
          getSetting('tomanRate')
        ]);
        setOrders(fetchedOrders);
        if (rate) setTomanRate(Number(rate));
      } catch (error) {
        toast({ title: "Error", description: "Could not fetch initial data.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    loadInitialData();
  }, [toast]);

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const handleUpdateStatus = async (orderId: string, status: Order['status']) => {
    try {
      const updatedOrder = await updateOrderStatus(orderId, status);
      setOrders(orders.map(o => o.id === orderId ? updatedOrder : o));
      toast({ title: "Success", description: `Order status updated to ${status}.`});
    } catch (error) {
      toast({ title: "Error", description: "Could not update order status.", variant: "destructive" });
    } finally {
      setIsDetailOpen(false);
      setSelectedOrder(null);
    }
  };
  
  const handleDeleteOrder = async (orderId: string) => {
    setIsDeleting(orderId);
    try {
      await deleteOrder(orderId);
      setOrders(orders.filter(o => o.id !== orderId));
      toast({ title: "Success", description: "Order has been deleted." });
    } catch (error) {
      toast({ title: "Error", description: "Could not delete the order.", variant: "destructive" });
    } finally {
      setIsDeleting(null);
    }
  }
  
  const getStatusVariant = (status: Order['status']) => {
    switch (status) {
      case 'completed': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };
  
  const isImageDataUrl = (url: string) => url.startsWith('data:image');
  const isUploadedFilePath = (url: string) => url.startsWith('/uploads/');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manage Orders</h1>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : orders.length > 0 ? (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">{order.id.slice(-6)}</TableCell>
                    <TableCell className="font-medium">
                      {order.user_name}
                    </TableCell>
                    <TableCell>{new Date(order.date).toLocaleString()}</TableCell>
                    <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>
                       <Badge variant={getStatusVariant(order.status)} className="capitalize">{order.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleViewDetails(order)}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View Details</span>
                      </Button>
                      <AlertDialog>
                          <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" disabled={isDeleting === order.id}>
                                {isDeleting === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                                <span className="sr-only">Delete Order</span>
                              </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                              <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                  This action will permanently delete the order <span className='font-mono font-bold'>{order.id}</span>. This cannot be undone.
                              </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDeleteOrder(order.id)}>
                                  Yes, delete
                              </AlertDialogAction>
                              </AlertDialogFooter>
                          </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No orders found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Order Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details: {selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              Review payment proof and approve or reject the order.
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <>
                <ScrollArea className="max-h-[60vh] pr-6">
                    <div className="space-y-4 py-4">
                        <div>
                            <h3 className="font-semibold mb-2">
                              Payer: {selectedOrder.user_name}
                            </h3>
                            <p className="text-sm text-muted-foreground">Date: {new Date(selectedOrder.date).toLocaleString()}</p>
                        </div>
                        <Card>
                            <CardHeader><CardTitle className="text-lg">Order Items</CardTitle></CardHeader>
                            <CardContent>
                                <ul className="list-disc list-inside space-y-1">
                                    {selectedOrder.items.map(item => (
                                        <li key={item.id}>
                                            {item.title} - <strong>{item.price}</strong>
                                            <Badge variant="outline" className="ml-2 capitalize">{item.type}</Badge>
                                            {item.recipientUsername && (
                                                <span className="text-xs text-primary font-medium ml-2">(For: {item.recipientUsername})</span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                                <p className="font-bold text-right mt-4">
                                  Total: ${selectedOrder.totalAmount.toFixed(2)}{' '}
                                  <span className='text-muted-foreground'>
                                      (≈ {(selectedOrder.totalAmount * tomanRate).toLocaleString('fa-IR')} Toman)
                                  </span>
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle className="text-lg">Payment Proof</CardTitle></CardHeader>
                            <CardContent>
                                {selectedOrder.paymentProof && selectedOrder.paymentType === 'receipt' && (isImageDataUrl(selectedOrder.paymentProof) || isUploadedFilePath(selectedOrder.paymentProof)) ? (
                                    <Image src={selectedOrder.paymentProof} alt="Payment Receipt" width={400} height={400} className="rounded-md border object-contain" />
                                ) : selectedOrder.paymentType === 'text' && selectedOrder.paymentProof ? (
                                    <pre className="p-4 bg-muted rounded-md text-sm text-muted-foreground whitespace-pre-wrap font-mono">{selectedOrder.paymentProof}</pre>
                                ) : (
                                    <p className="text-muted-foreground">No payment proof submitted for this order.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </ScrollArea>
                <DialogFooter className="pt-4">
                {selectedOrder?.status === 'pending' && (
                    <div className='flex gap-2'>
                        <Button variant="destructive" onClick={() => handleUpdateStatus(selectedOrder!.id, 'rejected')}>
                        <X className="mr-2 h-4 w-4" /> Reject
                        </Button>
                        <Button onClick={() => handleUpdateStatus(selectedOrder!.id, 'completed')}>
                        <Check className="mr-2 h-4 w-4" /> Approve
                        </Button>
                    </div>
                )}
                </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
