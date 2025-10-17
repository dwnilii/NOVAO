'use client';

import { useEffect, useState, useMemo, useContext } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import QRCode from "react-qr-code";
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
import { ClientDownloadLinks } from "@/components/client-download-links";
import { addOrder, getOrdersByUserId, getSetting } from "@/lib/api";
import { LanguageContext } from "@/context/language-context";
import { translations } from "@/lib/translations";

type ClientLinks = {
  android: string | null;
  windows: string | null;
  ios: string | null;
  macos: string | null;
};

export default function UserDashboardPage() {
  const { user: authUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { language } = useContext(LanguageContext);
  const t = translations[language];

  const [orders, setOrders] = useState<Order[]>([]);
  const [clientLinks, setClientLinks] = useState<ClientLinks>({ android: null, windows: null, ios: null, macos: null });
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    if (authUser?.id) {
      setIsLoading(true);
      Promise.all([
        getOrdersByUserId(authUser.id),
        getSetting('clientLink_android'),
        getSetting('clientLink_windows'),
        getSetting('clientLink_ios'),
        getSetting('clientLink_macos'),
      ])
        .then(([userOrders, android, windows, ios, macos]) => {
          setOrders(userOrders);
          setClientLinks({ android, windows, ios, macos });
        })
        .catch(err => {
          console.error("Error fetching initial data:", err);
          toast({ title: "Error", description: "Could not load dashboard data.", variant: "destructive" });
        })
        .finally(() => setIsLoading(false));
    }
  }, [authUser, toast]);
  
  useEffect(() => {
    if (!authLoading && !authUser) {
      router.push("/user-login");
    }
  }, [authUser, authLoading, router]);

  const handleAddToCart = (item: CartItem) => {
      const cartItemId = `${item.productId}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      onAddToCart({ ...item, id: cartItemId });
  };
  
  const onAddToCart = (item: CartItem) => {
    setCart(prevCart => [...prevCart, item]);
    toast({
        title: t.toast.addedToCart.title,
        description: `${item.title} ${t.toast.addedToCart.description}`,
    });
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart(prevCart => {
        const itemIndex = prevCart.findIndex(item => item.id === itemId);
        if (itemIndex > -1) {
            const newCart = [...prevCart];
            newCart.splice(itemIndex, 1);
            return newCart;
        }
        return prevCart;
    });
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

  const pageLoading = authLoading || isLoading;
  const user = authUser as User | null;

  if (pageLoading || !user) {
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
             <ClientDownloadLinks links={{android: '#', windows: '#', ios: '#', macos: '#'}} />
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
  const configLink = user.config || "No config available.";
  
  const qrCodeValue = user.sublink || user.config || "";

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
                
                <OrderHistoryDialog userOrders={orders}>
                    <Button variant="ghost" className="w-full sm:w-auto">
                        <History className="mr-2 h-4 w-4" />
                        {t.buttons.myOrders}
                    </Button>
                </OrderHistoryDialog>
              </CardFooter>
            </Card>
            
            <ClientDownloadLinks links={clientLinks} />

          </div>

          <div className="lg:col-span-1">
              <Card className="flex flex-col h-full">
                  <CardHeader>
                      <CardTitle>{t.subLink.title}</CardTitle>
                      <CardDescription>{t.subLink.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col items-center justify-center gap-4">
                      {qrCodeValue ? (
                        <div className="w-48 h-48 rounded-lg border bg-white p-2">
                           <QRCode
                            size={256}
                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                            value={qrCodeValue}
                            viewBox={`0 0 256 256`}
                            />
                        </div>
                      ) : (
                         <div className="w-48 h-48 rounded-lg border bg-muted flex items-center justify-center">
                            <p className="text-sm text-muted-foreground text-center">No link available for QR code.</p>
                         </div>
                      )}
                  </CardContent>
                  <CardFooter className="flex-col justify-center gap-2">
                      {user.config ? (
                          <CopyButton textToCopy={configLink} toastMessage={"Config copied to clipboard."} className="w-full max-w-xs">
                             Copy Config
                          </CopyButton>
                      ) : null}
                      {user.sublink ? (
                          <CopyButton textToCopy={subscriptionLink} toastMessage={t.toast.subLinkCopied} className="w-full max-w-xs">
                             {t.buttons.copySubLink}
                          </CopyButton>
                      ) : null}
                      {!user.config && !user.sublink && (
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
