'use client';

import { useContext, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { CartItem } from '@/lib/types';
import { X } from 'lucide-react';
import { Separator } from './ui/separator';
import { LanguageContext } from '@/context/language-context';
import { translations, getTomanRate } from '@/lib/translations';

interface ShoppingCartProps {
  cart: CartItem[];
  onRemoveFromCart: (itemId: string) => void;
  onProceedToCheckout: () => void;
}

export function ShoppingCart({ cart, onRemoveFromCart, onProceedToCheckout }: ShoppingCartProps) {
  const { language } = useContext(LanguageContext);
  const t = translations[language].cart;
  const [tomanRate, setTomanRate] = useState(60000);

  useEffect(() => {
    if (language === 'fa') {
      getTomanRate().then(setTomanRate);
    }
  }, [language]);


  const calculateTotal = () => {
    const totalUSD = cart.reduce((total, item) => {
      const numericPrice = parseFloat(String(item.price).replace(/[^0-9.]/g, ''));
      if (isNaN(numericPrice)) return total;
      return total + numericPrice;
    }, 0);

    if (language === 'fa') {
      return `${(totalUSD * tomanRate).toLocaleString('fa-IR')} ${t.currency}`;
    }
    return `$${totalUSD.toFixed(2)}`;
  };

  const getItemPrice = (item: CartItem) => {
    const numericPrice = parseFloat(String(item.price).replace(/[^0-9.]/g, ''));
    if (isNaN(numericPrice)) return item.price;
    
     if (language === 'fa') {
      return `${(numericPrice * tomanRate).toLocaleString('fa-IR')} ${t.currency}`;
    }
    return `$${numericPrice.toFixed(2)}`;
  };

  return (
    <>
        <div className="p-0">
            {cart.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">{t.empty}</p>
            ) : (
                <div className="space-y-3">
                    {cart.map(item => (
                        <div key={item.id} className="flex justify-between items-start text-sm">
                            <div className="flex-1">
                                <p className="font-medium">{item.title}</p>
                                {item.recipientUsername ? (
                                    <p className="text-xs text-primary font-medium">For: {item.recipientUsername}</p>
                                ) : (
                                    <p className="text-xs text-muted-foreground">{item.type === 'plan' ? t.subscription : t.extraTraffic}</p>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="font-semibold">{getItemPrice(item)}</span>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onRemoveFromCart(item.id!)}>
                                    <X className="h-4 w-4 text-red-500 transition-transform hover:scale-125 hover:text-red-400"/>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
        {cart.length > 0 && (
            <>
                <Separator className="my-4" />
                <div className="flex-col items-stretch space-y-4">
                    <div className="flex justify-between font-semibold text-lg">
                        <span>{t.total}:</span>
                        <span>{calculateTotal()}</span>
                    </div>
                    <Button className="w-full" onClick={onProceedToCheckout}>
                        {t.checkout}
                    </Button>
                </div>
            </>
        )}
    </>
  );
}
