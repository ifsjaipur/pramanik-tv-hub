'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Home, Heart, BookMarked, BookOpen, HelpCircle, Star, CalendarDays, Search } from 'lucide-react';

declare global {
  interface Window {
    __tvApp?: boolean;
    __tvSidebarOpen?: () => void;
    __tvSidebarClose?: () => void;
    __tvSidebarIsOpen?: () => boolean;
  }
}

const navItems = [
  { href: '/', label: 'Home', labelHi: 'होम', icon: Home },
  { href: '/bhawna-yog', label: 'Bhawna Yog', labelHi: 'भावना योग', icon: Heart },
  { href: '/swadhyay', label: 'Swadhyay', labelHi: 'स्वाध्याय', icon: BookMarked },
  { href: '/pravachan', label: 'Pravachan', labelHi: 'प्रवचन', icon: BookOpen },
  { href: '/qa', label: 'Q&A', labelHi: 'शंका', icon: HelpCircle },
  { href: '/kids', label: 'Kids', labelHi: 'बच्चे', icon: Star },
  { href: '/events', label: 'Events', labelHi: 'आयोजन', icon: CalendarDays },
  { href: '/search', label: 'Search', labelHi: 'खोज', icon: Search },
];

export default function TvSidebar() {
  const pathname = usePathname();
  const [isApp, setIsApp] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    // Detect Android TV app context
    if (typeof window !== 'undefined' && window.__tvApp) {
      setIsApp(true);
    }
    // Also listen for it being set later by injected JS
    const check = setInterval(() => {
      if (window.__tvApp) {
        setIsApp(true);
        clearInterval(check);
      }
    }, 500);
    return () => clearInterval(check);
  }, []);

  // Close menu on navigation
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Expose open/close for TvNavigation to call
  useEffect(() => {
    window.__tvSidebarOpen = () => setMenuOpen(true);
    window.__tvSidebarClose = () => setMenuOpen(false);
    window.__tvSidebarIsOpen = () => menuOpen;
  }, [menuOpen]);

  // In the Android TV app, render as overlay menu
  if (isApp) {
    return (
      <>
        {/* Backdrop */}
        {menuOpen && (
          <div
            className="fixed inset-0 z-[90] bg-black/70"
            onClick={() => setMenuOpen(false)}
          />
        )}
        {/* Slide-out sidebar */}
        <aside
          className={`fixed left-0 top-0 z-[100] flex h-screen w-[260px] flex-col bg-neutral-950 border-r border-neutral-800/50 transition-transform duration-300 ${
            menuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          data-tv-sidebar-overlay="true"
        >
          {/* Logo */}
          <div className="flex items-center gap-3 px-5 py-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-saffron-500 text-white font-bold text-lg">
              P
            </div>
            <div>
              <span className="text-lg font-bold text-white">Pramanik</span>
              <p className="text-[10px] text-neutral-500 -mt-0.5">TV</p>
            </div>
          </div>

          {/* Nav items */}
          <nav className="flex-1 px-3 py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-tv-nav="sidebar"
                  className={`tv-nav-item flex items-center gap-3 rounded-lg px-4 py-3 mb-1 text-sm font-medium ${
                    isActive
                      ? 'bg-saffron-500/15 border-l-saffron-400 text-saffron-400'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                  tabIndex={0}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>
      </>
    );
  }

  // Desktop/browser: fixed sidebar (always visible)
  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-[220px] flex-col bg-neutral-950 border-r border-neutral-800/50">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-saffron-500 text-white font-bold text-lg">
          P
        </div>
        <div>
          <span className="text-lg font-bold text-white">Pramanik</span>
          <p className="text-[10px] text-neutral-500 -mt-0.5">TV</p>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              data-tv-nav="sidebar"
              className={`tv-nav-item flex items-center gap-3 rounded-lg px-4 py-3 mb-1 text-sm font-medium ${
                isActive
                  ? 'bg-saffron-500/15 border-l-saffron-400 text-saffron-400'
                  : 'text-neutral-400 hover:text-white'
              }`}
              tabIndex={0}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom branding */}
      <div className="px-5 py-4 border-t border-neutral-800/50">
        <p className="text-[10px] text-neutral-600">Muni Pramansagar Ji</p>
      </div>
    </aside>
  );
}
