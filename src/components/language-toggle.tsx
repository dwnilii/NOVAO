'use client';

import { useContext } from 'react';
import { Button } from '@/components/ui/button';
import { LanguageContext } from '@/context/language-context';
import { Languages } from 'lucide-react';

export function LanguageToggle() {
  const { language, setLanguage } = useContext(LanguageContext);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'fa' : 'en');
  };

  return (
    <Button variant="ghost" size="icon" onClick={toggleLanguage}>
      <Languages className="h-5 w-5" />
      <span className="sr-only">Toggle Language</span>
    </Button>
  );
}
