'use client';

import { useEffect, useState } from 'react';

declare global {
  interface Window {
    __tvApp?: boolean;
  }
}

export default function TvContentWrapper({ children }: { children: React.ReactNode }) {
  const [isApp, setIsApp] = useState(false);

  useEffect(() => {
    if (window.__tvApp) {
      setIsApp(true);
    }
    const check = setInterval(() => {
      if (window.__tvApp) {
        setIsApp(true);
        clearInterval(check);
      }
    }, 500);
    return () => clearInterval(check);
  }, []);

  return (
    <main
      id="tv-content"
      className={`h-screen overflow-y-auto overflow-x-hidden scrollbar-hide ${
        isApp ? 'ml-0' : 'ml-[220px]'
      }`}
    >
      {children}
    </main>
  );
}
