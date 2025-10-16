'use client';

import { Copy } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { useContext, useEffect, useState } from 'react';
import { LanguageContext } from '@/context/language-context';
import { translations } from '@/lib/translations';
import { getSetting } from '@/lib/api';

export function CreditCardDisplay() {
    const { toast } = useToast();
    const { language } = useContext(LanguageContext);
    const t = translations[language].creditCard;
    const [cardHolder, setCardHolder] = useState('ADMIN NAME');
    const [cardNumber, setCardNumber] = useState('**** **** **** ****');
    
    useEffect(() => {
        async function fetchCardDetails() {
            const [holder, number] = await Promise.all([
                getSetting('cardHolder'),
                getSetting('cardNumber')
            ]);
            if(holder) setCardHolder(holder);
            if(number) setCardNumber(number.replace(/(\d{4})/g, '$1 ').trim());
        }
        fetchCardDetails();
    }, []);

    const handleCopy = (text: string, fieldName: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: t.copied, description: `${fieldName} ${t.copiedToClipboard}` });
    }

  return (
    <div className="w-full max-w-sm rounded-xl bg-gradient-to-br from-primary/80 to-primary/60 p-6 text-primary-foreground shadow-lg backdrop-blur-lg">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-xs font-light tracking-wider">{t.cardHolder}</p>
          <div className='flex items-center gap-2'>
            <p className="font-medium tracking-wide">{cardHolder}</p>
             <Button variant="ghost" size="icon" className="h-6 w-6 text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/20" onClick={() => handleCopy(cardHolder, t.cardHolder)}>
                <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <svg width="48" height="48" viewBox="0 0 128 41" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary-foreground">
          <path d="M37.3303 0.838623H23.5358L15.4223 21.0536L13.259 13.9142L8.79093 0.838623H0.252441L11.5647 39.865H19.9882L37.3303 0.838623Z" fill="currentColor" fillOpacity="0.7"/>
          <path d="M60.9165 1.15796C58.3377 0.392906 55.4395 0 52.3314 0C42.4552 0 34.3418 5.63214 34.3418 13.9777C34.3418 20.354 39.8131 23.9536 43.5317 25.7533C47.2503 27.5531 48.6045 28.8475 48.6045 30.461C48.6045 32.562 46.2238 33.7929 43.645 33.7929C40.0454 33.7929 38.0097 32.8159 35.8464 31.8388L34.7733 40.1844C36.9366 40.8859 40.418 41.25 43.7449 41.25C54.108 41.25 62.2215 35.7491 62.2215 27.2797C62.2215 18.6384 54.4913 14.6183 49.3385 12.3996C45.3664 10.5998 43.9487 9.36886 43.9487 7.75533C43.9487 6.07828 45.892 5.03774 48.3882 5.03774C50.5515 5.03774 52.5872 5.58944 54.3057 6.35449L55.5921 6.14158C56.9464 5.92867 58.2372 5.31345 59.3738 4.41703L60.9165 1.15796Z" fill="currentColor"/>
          <path d="M85.4924 0.838623L78.7109 40.0179H87.402L94.1835 0.838623H85.4924Z" fill="currentColor"/>
          <path d="M109.843 0.838623L101.483 39.865H110.174L118.534 0.838623H109.843Z" fill="currentColor"/>
          <path d="M128 20.4184C128 31.5795 120.333 40.0179 111.409 40.0179L106.32 0.838623H115.553L115.872 3.16723C122.973 3.65476 128 11.1442 128 20.4184ZM117.84 20.4184C117.84 13.8609 113.805 9.05389 108.652 8.68067L104.553 35.7491C109.425 35.2616 117.84 28.5939 117.84 20.4184Z" fill="currentColor" fillOpacity="0.7"/>
          <path d="M77.4069 0.838623H70.1939C69.0573 0.838623 68.1006 1.73495 67.9254 2.87158L59.2344 40.0179H68.2163L77.4069 0.838623Z" fill="currentColor"/>
        </svg>
      </div>
      <div className="mt-6 space-y-2">
        <p className="text-xs font-light tracking-wider">{t.cardNumber}</p>
        <div className='flex items-center gap-2'>
            <p className="font-mono text-lg tracking-widest">{cardNumber}</p>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/20" onClick={() => handleCopy(cardNumber.replace(/\s/g, ''), t.cardNumber)}>
                <Copy className="h-4 w-4" />
            </Button>
        </div>
      </div>
    </div>
  );
}
