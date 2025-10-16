'use client';

import React, { createContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';

export type Language = 'en' | 'fa';

interface LanguageContextType {
  language: Language;
  setLanguage: Dispatch<SetStateAction<Language>>;
}

export const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}
