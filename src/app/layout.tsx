import type { Metadata, Viewport } from 'next';
import { DM_Sans, Noto_Sans_Devanagari } from 'next/font/google';
import './globals.css';
import TvSidebar from '@/components/tv/TvSidebar';
import TvNavigation from '@/components/tv/TvNavigation';
import TvContentWrapper from '@/components/tv/TvContentWrapper';
import { ThemeProvider } from '@/components/ui/ThemeProvider';
import { LanguageProvider } from '@/components/ui/LanguageProvider';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  variable: '--font-noto-devanagari',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://tv.munipramansagar.net'),
  title: {
    default: 'Pramanik TV',
    template: '%s | Pramanik TV',
  },
  description: 'Discourses, Bhawna Yog, Shanka Samadhan and Jain Pathshala by Muni Pramansagar Ji Maharaj',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hi" className="dark">
      <body
        className={`${dmSans.variable} ${notoDevanagari.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          <LanguageProvider>
            <TvSidebar />
            <TvContentWrapper>
              {children}
            </TvContentWrapper>
            <TvNavigation />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
