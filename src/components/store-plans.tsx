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


  const currentUserPlan = user ? plans.find(p => p.title === user.planTitle) : null;
  
  // This function now generates a unique ID for each cart item instance
  const generateCartItemId = (item: PricingPlan, recipientUsername?: string) => {
    const randomSuffix = Math.random().toString(36).substr(2, 5);
    const timeSuffix = Date.now().toString(36);
    const baseId = recipientUsername ? `${item.id}_for_${recipientUsername}` : item.id;
    return `${baseId}_${timeSuffix}_${randomSuffix}`;
  };

  const handleAddToCartForSelf = (item: PricingPlan, type: 'plan' | 'traffic') => {
      const cartItemId = generateCartItemId(item);
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
    const cartItemId = generateCartItemId(item, username);
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
      <div className="px-6 py-2 space-y-8">
        {/* Subscription Plans Section */}
        <div>
          <CardHeader className="px-1 -mx-1">
            <CardTitle>{t.subscriptions.title}</CardTitle>
            <CardDescription>{t.subscriptions.description}</CardDescription>
          </CardHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plans.map((plan) => {
              const isCurrent = plan.id === currentUserPlan?.id;

              return (
                <div key={plan.id} className="flex flex-col rounded-lg bg-gradient-to-br from-muted/50 to-muted/20 p-4 border border-border/50 transition-all hover:shadow-lg hover:border-primary/50">
                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-lg">{plan.title}</h4>
                         {plan.popular && <div className="text-xs bg-primary text-primary-foreground font-bold px-2 py-0.5 rounded-full">POPULAR</div>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {plan.duration} / {plan.data} / {plan.devices}
                    </p>
                    <p className="font-bold text-2xl">{getDisplayPrice(plan.price)}</p>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => handleAddToCartForSelf(plan, 'plan')}
                      disabled={isCurrent}
                      variant={isCurrent ? 'secondary' : 'default'}
                      size="sm"
                      className="w-full"
                    >
                      {isCurrent ? t.buttons.currentPlan : t.buttons.addToCart}
                    </Button>
                    <GiftDialog onConfirm={(username) => handleGiftConfirm(plan, 'plan', username)}>
                      <Button variant="secondary" size="sm" className='px-3'>
                        <Gift className="h-4 w-4" />
                      </Button>
                    </GiftDialog>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Extra Traffic Section */}
        {trafficPacks.length > 0 && (
          <div>
            <CardHeader className="px-1 -mx-1">
              <CardTitle>{t.traffic.title}</CardTitle>
              <CardDescription>{t.traffic.description}</CardDescription>
            </CardHeader>
            <div className="space-y-3">
              {trafficPacks.map((pack) => {
                return (
                  <div key={pack.id} className="flex items-center justify-between rounded-lg border bg-muted/30 p-3 transition-all hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <Zap className="h-5 w-5 text-primary/80" />
                      <div>
                        <span className="font-medium">{pack.data}</span>
                        <p className="text-xs text-muted-foreground">{pack.duration}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAddToCartForSelf(pack, 'traffic')}
                        variant="secondary"
                      >
                        {`${t.buttons.add} - ${getDisplayPrice(pack.price)}`}
                      </Button>
                      <GiftDialog onConfirm={(username) => handleGiftConfirm(pack, 'traffic', username)}>
                        <Button variant="secondary" size="sm" className='px-3'>
                          <Gift className="h-4 w-4" />
                        </Button>
                      </GiftDialog>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
