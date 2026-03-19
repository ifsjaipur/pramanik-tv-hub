import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin | Pramanik Video Hub',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900">
      {children}
    </div>
  );
}
