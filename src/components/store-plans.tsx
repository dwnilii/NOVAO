'use client';

import { useContext, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Zap, Check, Loader2, Gift } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { PricingPlan, CartItem } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';
import { LanguageContext } from '@/context/language-context';
import { translations, getTomanRate } from '@/lib/translations';
import { getPricingPlans, getTrafficPacks } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';


interface StorePlansProps {
    onAddToCart: (item: CartItem) => void;
    cart: CartItem[];
}

function GiftDialog({ onConfirm, children }: { onConfirm: (username: string) => void, children: React.ReactNode }) {
    const [username, setUsername] = useState('');
    const t = translations[useContext(LanguageContext).language].checkout.gift;

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t.dialogTitle}</AlertDialogTitle>
                    <AlertDialogDescription>{t.dialogDescription}</AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4">
                    <Label htmlFor="gift-username" className="text-right">{t.usernameLabel}</Label>
                    <Input
                        id="gift-username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="mt-2"
                        placeholder={t.placeholder}
                    />
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t.dialogCancel}</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onConfirm(username)} disabled={!username.trim()}>{t.dialogConfirm}</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}


export function StorePlans({ onAddToCart, cart }: StorePlansProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { language } = useContext(LanguageContext);
  const t = translations[language].store;
  const [tomanRate, setTomanRate] = useState(60000);
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [trafficPacks, setTrafficPacks] = useState<PricingPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStoreData() {
        try {
            setIsLoading(true);
            const [fetchedPlans, fetchedPacks, rate] = await Promise.all([
                getPricingPlans(),
                getTrafficPacks(),
                language === 'fa' ? getTomanRate() : Promise.resolve(60000)
            ]);
            setPlans(fetchedPlans.filter(p => p.available));
            setTrafficPacks(fetchedPacks.filter(p => p.available));
            setTomanRate(rate);
        } catch (error) {
            console.error("Failed to load store data:", error);
        } finally {
            setIsLoading(false);
        }
    }
    loadStoreData();
  }, [language]);


  const currentUserPlan = user ? plans.find(p => p.data === user.total) : null;
  
  // This function now generates a unique ID for each cart item
  // For gifts, it appends the recipient's username to ensure uniqueness
  const generateCartItemId = (item: PricingPlan, recipientUsername?: string) => {
    return recipientUsername ? `${item.id}_for_${recipientUsername}` : item.id!;
  };

  const isItemInCart = (itemId: string) => !!cart.find(item => item.id === itemId);
  
  const handleAddToCartForSelf = (item: PricingPlan, type: 'plan' | 'traffic') => {
      const cartItemId = generateCartItemId(item);
      if (isItemInCart(cartItemId)) return; // Already in cart for self
      onAddToCart({ ...item, type, id: cartItemId, productId: item.id });
  };
  
  const handleGiftConfirm = (item: PricingPlan, type: 'plan' | 'traffic', username: string) => {
    if (username.toLowerCase() === user?.name.toLowerCase()) {
        toast({
            title: t.cannotGiftToSelf.title,
            description: t.cannotGiftToSelf.description,
            variant: 'destructive',
        });
        return;
    }
    // Generate a unique ID for this specific gift instance
    const cartItemId = generateCartItemId(item, username);
    if (isItemInCart(cartItemId)) {
        toast({
            title: "Gift Already in Cart",
            description: `You already have a gift of '${item.title}' in your cart for ${username}.`,
            variant: 'destructive'
        });
        return;
    }
    onAddToCart({ ...item, type, recipientUsername: username, id: cartItemId, productId: item.id });
  };


  const getDisplayPrice = (price: string | number) => {
    const numericPrice = parseFloat(String(price).replace(/[^0-9.]/g, ''));
    if (isNaN(numericPrice)) return price;

    if (language === 'fa') {
      const tomanPrice = (numericPrice * tomanRate).toLocaleString('fa-IR');
      return `${tomanPrice} ${t.currency}`;
    }
    return `$${numericPrice.toFixed(2)}`;
  }

  if (isLoading) {
      return (
          <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      )
  }

  return (
    <ScrollArea className="flex-1 -mx-6">
      <div className="grid grid-cols-1 gap-8 px-6">
          <Tabs defaultValue="subscriptions" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="subscriptions">{t.tabs.subscriptions}</TabsTrigger>
                  <TabsTrigger value="traffic">{t.tabs.traffic}</TabsTrigger>
              </TabsList>
              <TabsContent value="subscriptions" className="mt-4">
                  <Card className="border-none shadow-none bg-transparent">
                  <CardHeader className="px-1">
                      <CardTitle>{t.subscriptions.title}</CardTitle>
                      <CardDescription>{t.subscriptions.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 px-1">
                      {plans.map((plan, index) => {
                        const selfCartItemId = generateCartItemId(plan);
                        const inCartForSelf = isItemInCart(selfCartItemId);
                        const isCurrent = plan.id === currentUserPlan?.id;
                        
                        return (
                          <div key={index} className="flex flex-col space-y-3 rounded-lg border bg-muted/30 p-4 transition-all hover:shadow-md">
                              <div className="flex items-start justify-between">
                                  <div className="space-y-1">
                                      <h4 className="font-semibold">{plan.title}</h4>
                                      <p className="text-xs text-muted-foreground">
                                          {plan.duration} / {plan.data} / {plan.devices}
                                      </p>
                                  </div>
                                  <p className="font-bold text-lg">{getDisplayPrice(plan.price)}</p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                    onClick={() => handleAddToCartForSelf(plan, 'plan')}
                                    disabled={isCurrent || inCartForSelf}
                                    variant={plan.popular ? 'default' : 'secondary'}
                                    size="sm"
                                    className="w-full"
                                >
                                    {isCurrent ? t.buttons.currentPlan : inCartForSelf ? <><Check className="mr-2 h-4 w-4" /> {t.buttons.addedToCart}</> : t.buttons.addToCart}
                                </Button>
                                <GiftDialog onConfirm={(username) => handleGiftConfirm(plan, 'plan', username)}>
                                     <Button variant="secondary" size="sm">
                                        <Gift className="h-4 w-4" />
                                    </Button>
                                </GiftDialog>
                              </div>
                          </div>
                        )
                      })}
                  </CardContent>
                  </Card>
              </TabsContent>
              <TabsContent value="traffic" className="mt-4">
                  <Card className="border-none shadow-none bg-transparent">
                  <CardHeader className="px-1">
                      <CardTitle>{t.traffic.title}</CardTitle>
                      <CardDescription>{t.traffic.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="w-full space-y-3 px-1">
                      {trafficPacks.map((pack) => {
                        const selfCartItemId = generateCartItemId(pack);
                        const inCartForSelf = isItemInCart(selfCartItemId);
                        return (
                          <div key={pack.id} className="flex items-center justify-between rounded-lg border bg-muted/30 p-3 transition-all hover:shadow-md">
                              <div className="flex items-center gap-3">
                              <Zap className="h-5 w-5 text-primary/80" />
                              <div className="space-y-1">
                                  <span className="font-medium">{pack.data}</span>
                                  <p className="text-xs text-muted-foreground">{pack.duration}</p>
                              </div>
                            
                              </div>
                               <div className="flex items-center gap-2">
                                 <Button 
                                      size="sm" 
                                      onClick={() => handleAddToCartForSelf(pack, 'traffic')} 
                                      variant="secondary"
                                      disabled={inCartForSelf}
                                  >
                                    {inCartForSelf ? <><Check className="mr-2 h-4 w-4" /> {t.buttons.added}</> : `${t.buttons.add} - ${getDisplayPrice(pack.price)}`}
                                  </Button>
                                   <GiftDialog onConfirm={(username) => handleGiftConfirm(pack, 'traffic', username)}>
                                     <Button variant="secondary" size="sm">
                                        <Gift className="h-4 w-4" />
                                    </Button>
                                </GiftDialog>
                               </div>
                          </div>
                        )
                      })}
                  </CardContent>
                  </Card>
              </TabsContent>
          </Tabs>
      </div>
    </ScrollArea>
  );
}
