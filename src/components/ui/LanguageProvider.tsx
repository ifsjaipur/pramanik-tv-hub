'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Language = 'en' | 'hi';

interface LanguageContextValue {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'hi',
  toggleLanguage: () => {},
  t: (key: string) => key,
});

export function useLanguage() {
  return useContext(LanguageContext);
}

// Import messages statically to avoid dynamic import issues
import enMessages from '@/messages/en.json';
import hiMessages from '@/messages/hi.json';

const messages: Record<Language, Record<string, unknown>> = {
  en: enMessages,
  hi: hiMessages,
};

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current && typeof current === 'object' && key in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path;
    }
  }
  return typeof current === 'string' ? current : path;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('hi');

  useEffect(() => {
    const stored = localStorage.getItem('language') as Language | null;
    if (stored) {
      setLanguage(stored);
    } else if (typeof navigator !== 'undefined' && navigator.language.startsWith('hi')) {
      setLanguage('hi');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = () => setLanguage((l) => (l === 'en' ? 'hi' : 'en'));

  const t = (key: string) => getNestedValue(messages[language], key);

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
