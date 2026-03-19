'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Compass, Heart, BookMarked, Star, Menu, X, HelpCircle, BookOpen, CalendarDays, Search } from 'lucide-react';
import { useLanguage } from '@/components/ui/LanguageProvider';

const tabs = [
  { labelEn: 'Explore', labelHi: 'देखें', icon: Compass, href: '/' },
  { labelEn: 'Bhawna Yog', labelHi: 'भावना', icon: Heart, href: '/bhawna-yog' },
  { labelEn: 'Swadhyay', labelHi: 'स्वाध्याय', icon: BookMarked, href: '/swadhyay' },
  { labelEn: 'Kids', labelHi: 'बच्चे', icon: Star, href: '/kids' },
];

const moreLinks = [
  { labelEn: 'Shanka Samadhan', labelHi: 'शंका समाधान', icon: HelpCircle, href: '/qa' },
  { labelEn: 'Pravachan', labelHi: 'प्रवचन', icon: BookOpen, href: '/pravachan' },
  { labelEn: 'Events', labelHi: 'आयोजन', icon: CalendarDays, href: '/events' },
  { labelEn: 'Search', labelHi: 'खोज', icon: Search, href: '/search' },
];

export default function MobileNav() {
  const pathname = usePathname();
  const { language } = useLanguage();
  const [showMore, setShowMore] = useState(false);

  const isMoreActive = moreLinks.some((l) => pathname.startsWith(l.href));

  return (
    <>
      {showMore && (
        <div className="fixed inset-0 z-50 md:hidden" onClick={() => setShowMore(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute bottom-[60px] left-0 right-0 rounded-t-2xl bg-white p-4 pb-2 safe-bottom dark:bg-neutral-900" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">More</h3>
              <button onClick={() => setShowMore(false)} className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {moreLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setShowMore(false)}
                    className={"flex flex-col items-center gap-1 rounded-xl p-3 text-[10px] font-medium transition-colors " +
                      (isActive ? "bg-saffron-50 text-saffron-500 dark:bg-saffron-900/20" : "text-neutral-600 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-800")
                    }
                  >
                    <Icon className="h-5 w-5" />
                    <span>{language === 'hi' ? link.labelHi : link.labelEn}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-200 bg-white/95 backdrop-blur-sm safe-bottom md:hidden dark:border-neutral-800 dark:bg-neutral-950/95">
        <div className="flex items-center justify-around py-1.5">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href));
            const Icon = tab.icon;
            const label = language === 'hi' ? tab.labelHi : tab.labelEn;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={"flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-medium transition-colors " +
                  (isActive ? "text-saffron-500" : "text-neutral-500 dark:text-neutral-400")
                }
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setShowMore(!showMore)}
            className={"flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-medium transition-colors " +
              (isMoreActive || showMore ? "text-saffron-500" : "text-neutral-500 dark:text-neutral-400")
            }
          >
            <Menu className="h-5 w-5" />
            <span>{language === 'hi' ? 'और' : 'More'}</span>
          </button>
        </div>
      </nav>
    </>
  );
}
