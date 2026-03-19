'use client';

import Link from 'next/link';
import { Search, Moon, Sun, Languages } from 'lucide-react';
import { useTheme } from '@/components/ui/ThemeProvider';
import { useLanguage } from '@/components/ui/LanguageProvider';

const navLinks = [
  { href: '/', labelEn: 'Explore', labelHi: 'देखें' },
  { href: '/bhawna-yog', labelEn: 'Bhawna Yog', labelHi: 'भावना योग' },
  { href: '/swadhyay', labelEn: 'Swadhyay', labelHi: 'स्वाध्याय' },
  { href: '/pravachan', labelEn: 'Pravachan', labelHi: 'प्रवचन' },
  { href: '/qa', labelEn: 'Q&A', labelHi: 'शंका' },
  { href: '/events', labelEn: 'Events', labelHi: 'आयोजन' },
  { href: '/kids', labelEn: 'Kids', labelHi: 'बच्चे' },
];

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-950/95">
      <div className="mx-auto flex h-11 max-w-7xl items-center justify-between px-4 md:h-16 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-saffron-500 text-white font-bold text-xs md:h-8 md:w-8 md:text-sm">
            P
          </div>
          <span className="text-sm font-bold text-neutral-900 sm:text-lg dark:text-white">
              Pramanik
            </span>
        </Link>

        <nav className="hidden items-center gap-5 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-neutral-600 hover:text-saffron-500 dark:text-neutral-400 dark:hover:text-saffron-400"
            >
              {language === 'hi' ? link.labelHi : link.labelEn}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/search"
            className="flex h-8 w-8 items-center justify-center rounded-full md:h-9 md:w-9 text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
          >
            <Search className="h-5 w-5" />
          </Link>
          <button
            onClick={toggleLanguage}
            className="flex h-8 items-center gap-1 rounded-full px-2 text-[10px] md:h-9 md:px-2.5 md:text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
          >
            <Languages className="h-4 w-4" />
            {language === 'hi' ? 'EN' : 'हि'}
          </button>
          <button
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-full md:h-9 md:w-9 text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </header>
  );
}
