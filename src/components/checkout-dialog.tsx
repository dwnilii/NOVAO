'use client';

import { useState, useRef, ChangeEvent, useContext, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { UploadCloud, Loader2 } from 'lucide-react';
import type { CartItem, User, Order } from '@/lib/types';
import { CreditCardDisplay } from './credit-card-display';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from './ui/scroll-area';
import { LanguageContext } from '@/context/language-context';
import { translations, getTomanRate } from '@/lib/translations';

interface CheckoutDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  cart: CartItem[];
  user: User;
  onOrderSubmit: (order: Omit<Order, 'id'>) => void;
}

export function CheckoutDialog({ isOpen, onOpenChange, cart, user, onOrderSubmit }: CheckoutDialogProps) {
  const [paymentType, setPaymentType] = useState<'receipt' | 'text'>('receipt');
  const [paymentProof, setPaymentProof] = useState<string>('');
  const [receiptPreview, setReceiptPreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { language } = useContext(LanguageContext);
  const t = translations[language].checkout;
  const [tomanRate, setTomanRate] = useState(60000);

  useEffect(() => {
    if (language === 'fa' && isOpen) {
      getTomanRate().then(setTomanRate);
    }
    if (isOpen) {
      setPaymentProof('');
      setReceiptPreview('');
      setPaymentType('receipt');
    }
  }, [language, isOpen]);

  const totalUSD = cart.reduce((sum, item) => {
    const price = parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 0;
    return sum + price;
  }, 0);
  
  const totalToman = (totalUSD * tomanRate).toLocaleString('fa-IR');
  const displayTotal = language === 'fa' ? `${totalToman} تومان` : `$${totalUSD.toFixed(2)}`;

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast({ 
        title: "Invalid File Type", 
        description: "Please upload a JPG, PNG, or GIF image.", 
        variant: 'destructive' 
      });
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({ 
        title: "File Too Large", 
        description: "Please upload an image smaller than 5MB.", 
        variant: 'destructive' 
      });
      return;
    }

    setReceiptPreview(URL.createObjectURL(file));
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      setPaymentProof(data.url);
      toast({ 
        title: "Upload Successful", 
        description: "Receipt image has been uploaded successfully." 
      });

    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not upload the receipt. Please try again.";
      toast({ 
        title: "Upload Failed", 
        description: message, 
        variant: 'destructive' 
      });
      setReceiptPreview('');
      setPaymentProof('');
    } finally {
      setIsUploading(false);
    }
  }
  };

  const triggerFileSelect = () => fileInputRef.current?.click();

  const handleSubmit = () => {
    if (!paymentProof) {
      toast({
        title: t.proofRequired.title,
        description: t.proofRequired.description,
        variant: "destructive",
      })
      return;
    }
    
    const newOrder: Omit<Order, 'id'> = {
      user_id: user.id,
      user_name: user.name,
      items: cart,
      totalAmount: totalUSD,
      status: 'pending',
      date: new Date().toISOString(),
      paymentProof,
      paymentType,
    };
    onOrderSubmit(newOrder);
  };
  
  const canSubmit = (paymentType === 'text' ? paymentProof.trim() !== '' : (paymentProof !== '' && !isUploading));


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t.title}</DialogTitle>
          <DialogDescription>
            {t.description.replace('{total}', displayTotal)}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] -mx-6 px-6">
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg">{t.step1}</h3>
                    <p className="text-sm text-muted-foreground">{t.transfer.replace('{total}', displayTotal)}</p>
                    <CreditCardDisplay />
                </div>

                <div className="space-y-4">
                    <h3 className="font-semibold text-lg">{t.step2}</h3>
                    <Tabs value={paymentType} onValueChange={(value) => {
                        setPaymentType(value as 'receipt' | 'text');
                        setPaymentProof('');
                        setReceiptPreview('');
                    }} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="receipt">{t.tabs.receipt}</TabsTrigger>
                            <TabsTrigger value="text">{t.tabs.text}</TabsTrigger>
                        </TabsList>
                        <TabsContent value="receipt" className="mt-4">
                            <div 
                                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50"
                                onClick={!isUploading ? triggerFileSelect : undefined}
                            >
                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={isUploading}/>
                                {receiptPreview ? (
                                    <div className="relative w-full h-full">
                                        <Image src={receiptPreview} alt="Receipt Preview" fill objectFit="contain" className="rounded-lg" />
                                        {isUploading && (
                                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                                              <Loader2 className="w-8 h-8 text-white animate-spin" />
                                          </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                                        <p className="mb-2 text-sm text-muted-foreground">
                                            <span className="font-semibold">{t.upload.click}</span> {t.upload.drag}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{t.upload.types}</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                        <TabsContent value="text" className="mt-4">
                            <Textarea 
                                placeholder={t.pastePlaceholder}
                                className="h-48 resize-none"
                                value={paymentType === 'text' ? paymentProof : ''}
                                onChange={(e) => setPaymentProof(e.target.value)}
                                disabled={paymentType !== 'text'}
                            />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className='pt-4'>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t.buttons.cancel}</Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
            {isUploading ? 'Uploading...' : t.buttons.submit}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
