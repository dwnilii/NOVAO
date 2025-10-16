'use client';

import { useEffect, useState, useMemo, useContext } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { QrCodePlaceholder } from "@/components/qr-code";
import { CopyButton } from "@/components/copy-button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { History, ShoppingCart, Store } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StorePlans } from "@/components/store-plans";
import { ShoppingCart as ShoppingCartComponent } from "@/components/shopping-cart";
import { CheckoutDialog } from "@/components/checkout-dialog";
import type { CartItem, Order, User } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { OrderHistoryDialog } from "@/components/order-history-dialog";
import { addOrder } from "@/lib/api";
import { LanguageContext } from "@/context/language-context";
import { translations } from "@/lib/translations";

// This component receives orders and setOrders from its parent layout
export default function UserDashboardPage({ orders, setOrders, isOrdersLoading }: { orders: Order[], setOrders: React.Dispatch<React.SetStateAction<Order[]>>, isOrdersLoading: boolean }) {
  const { user: authUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { language } = useContext(LanguageContext);
  const t = translations[language];

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const userOrders = useMemo(() => {
    if (!authUser || !orders) return [];
    return orders.filter(order => order.user_id === authUser.id);
  }, [orders, authUser]);
  
  useEffect(() => {
    if (!authLoading && !authUser) {
      router.push("/user-login");
    }
  }, [authUser, authLoading, router]);

  const handleAddToCart = (item: CartItem) => {
    // For plans, only one can be bought for self
    if (item.type === 'plan' && !item.recipientUsername && cart.some(cartItem => cartItem.type === 'plan' && !cartItem.recipientUsername)) {
      toast({
        title: t.toast.planInCart.title,
        description: t.toast.planInCart.description,
        variant: 'destructive',
      });
      return;
    }
    setCart(prevCart => [...prevCart, item]);
    toast({
        title: t.toast.addedToCart.title,
        description: `${item.title} ${t.toast.addedToCart.description}`,
    });
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  const handleProceedToCheckout = () => {
    if (cart.length === 0) {
        toast({
            title: t.toast.cartEmpty.title,
            description: t.toast.cartEmpty.description,
            variant: 'destructive'
        });
        return;
    }
    setIsStoreOpen(false);
    setIsCartOpen(false); 
    setIsCheckoutOpen(true);
  };

  const handleOrderSubmit = async (orderData: Omit<Order, 'id'>) => {
    try {
        const newOrder = await addOrder(orderData);
        // Update the global orders state passed from the layout
        setOrders(prev => [newOrder, ...prev]);
        toast({
            title: t.toast.orderSubmitted.title,
            description: t.toast.orderSubmitted.description,
        });
        setCart([]);
        setIsCheckoutOpen(false);
    } catch (error) {
        toast({ title: "Error", description: "Failed to submit order.", variant: 'destructive'});
    }
  };

  const isLoading = authLoading || isOrdersLoading;
  const user = authUser as User | null;

  if (isLoading || !user) {
    return (
        <div className="space-y-6 font-persian">
        <Skeleton className="h-9 w-64" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader> <Skeleton className="h-6 w-40" /> </CardHeader>
                <CardContent className="grid gap-6 text-sm md:grid-cols-2">
                    <div className="space-y-2"> <Skeleton className="h-4 w-16" /> <Skeleton className="h-7 w-32" /> </div>
                    <div className="space-y-2"> <Skeleton className="h-4 w-12" /> <Skeleton className="h-7 w-20" /> </div>
                    <div className="space-y-2"> <Skeleton className="h-4 w-24" /> <Skeleton className="h-7 w-36" /> </div>
                </CardContent>
                 <CardFooter className="flex flex-col sm:flex-row gap-2">
                    <Skeleton className="h-10 w-full sm:w-auto" />
                    <Skeleton className="h-10 w-full sm:w-auto" />
                    <Skeleton className="h-10 w-full sm:w-auto" />
                </CardFooter>
            </Card>
            <Card>
                <CardHeader> <Skeleton className="h-6 w-32" /> </CardHeader>
                <CardContent>
                    <Skeleton className="h-3 w-full" />
                    <div className="mt-3 flex justify-between text-sm"> <Skeleton className="h-4 w-24" /> <Skeleton className="h-4 w-24" /> </div>
                </CardContent>
            </Card>
            </div>
             <div className="lg:col-span-1">
                <Card className="flex flex-col h-full">
                    <CardHeader> <Skeleton className="h-6 w-40" /> <Skeleton className="h-4 w-64" /> </CardHeader>
                    <CardContent className="flex flex-1 flex-col items-center justify-center gap-4">
                        <Skeleton className="w-48 h-48 rounded-lg" />
                        <Skeleton className="h-10 w-full max-w-xs" />
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    )
  }
  
  const subscriptionLink = user.sublink || "No subscription link available.";
  const usagePercentage = user.total > 0 ? (user.usage / user.total) * 100 : 0;
  
  return (
    <>
      <div className="space-y-6 font-persian">
        <h1 className="text-3xl font-bold">{t.welcome}, {user.name}!</h1>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t.subscriptionStatus.title}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6 text-sm md:grid-cols-2">
                <div className="space-y-1">
                  <p className="font-medium text-muted-foreground">{t.subscriptionStatus.plan}</p>
                  <p className="text-xl font-semibold">{user.planTitle || `${user.total}GB`}</p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-muted-foreground">{t.subscriptionStatus.status}</p>
                  <Badge variant={user.subscription === 'active' ? 'default' : 'destructive'} className="text-base capitalize">
                     {t.subscriptionStatus[user.subscription]}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-muted-foreground">{t.subscriptionStatus.expiration}</p>
                  <p className="text-xl font-semibold">
                     {user.expiryDate ? new Intl.DateTimeFormat(language === 'fa' ? 'fa-IR-u-nu-latn' : 'en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(user.expiryDate)) : 'N/A'}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-2">
                <Dialog open={isStoreOpen} onOpenChange={setIsStoreOpen}>
                    <DialogTrigger asChild>
                        <Button variant="secondary" className="w-full sm:w-auto">
                            <Store className="mr-2 h-4 w-4" />
                            {t.buttons.serviceStore}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl h-[80vh] flex flex-col font-persian">
                        <DialogHeader>
                            <DialogTitle>{t.store.title}</DialogTitle>
                            <DialogDescription>{t.store.description}</DialogDescription>
                        </DialogHeader>
                        <StorePlans onAddToCart={handleAddToCart} cart={cart} />
                    </DialogContent>
                </Dialog>
                
                <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="w-full sm:w-auto">
                            <ShoppingCart className="mr-2 h-4 w-4" />
                             {t.buttons.viewCart}
                             {cart.length > 0 && <Badge variant="destructive" className="ml-2">{cart.length}</Badge>}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md font-persian">
                        <DialogHeader>
                            <DialogTitle>{t.cart.title}</DialogTitle>
                            <DialogDescription>{t.cart.description}</DialogDescription>
                        </DialogHeader>
                        <ShoppingCartComponent
                            cart={cart}
                            onRemoveFromCart={handleRemoveFromCart}
                            onProceedToCheckout={handleProceedToCheckout}
                        />
                    </DialogContent>
                </Dialog>
                
                <OrderHistoryDialog userOrders={userOrders}>
                    <Button variant="ghost" className="w-full sm:w-auto">
                        <History className="mr-2 h-4 w-4" />
                        {t.buttons.myOrders}
                    </Button>
                </OrderHistoryDialog>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
              <CardTitle>{t.dataUsage.title}</CardTitle>
              </CardHeader>
              <CardContent>
              <Progress value={usagePercentage} className="h-3" />
              <div className="mt-3 flex justify-between text-sm">
                  <div className="text-muted-foreground">
                      <span className="font-bold text-foreground">{user.usage}GB</span> {t.dataUsage.used}
                  </div>
                  <div className="text-muted-foreground">
                      <span className="font-bold text-foreground">{user.total}GB</span> {t.dataUsage.total}
                  </div>
              </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
              <Card className="flex flex-col h-full">
                  <CardHeader>
                      <CardTitle>{t.subLink.title}</CardTitle>
                      <CardDescription>{t.subLink.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col items-center justify-center gap-4">
                      <div className="w-48 h-48 rounded-lg border bg-white p-2">
                        <QrCodePlaceholder />
                      </div>
                  </CardContent>
                  <CardFooter className="justify-center">
                      {user.sublink ? (
                          <CopyButton textToCopy={subscriptionLink} toastMessage={t.toast.subLinkCopied} className="w-full max-w-xs">
                             {t.buttons.copySubLink}
                          </CopyButton>
                      ) : (
                          <Button disabled className="w-full max-w-xs">{t.buttons.noLinkAvailable}</Button>
                      )}
                  </CardFooter>
              </Card>
          </div>
        </div>
      </div>
      {user && (
        <CheckoutDialog 
            isOpen={isCheckoutOpen}
            onOpenChange={setIsCheckoutOpen}
            cart={cart}
            user={user}
            onOrderSubmit={handleOrderSubmit}
        />
      )}
    </>
  );
}
