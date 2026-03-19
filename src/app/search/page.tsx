import type { Metadata } from 'next';
import { Suspense } from 'react';
import SearchBar from '@/components/search/SearchBar';
import SearchResults from '@/components/search/SearchResults';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search videos across all channels',
};

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900 dark:text-white md:text-3xl">
        Search
      </h1>

      <div className="mx-auto max-w-xl">
        <Suspense>
          <SearchBar />
        </Suspense>
      </div>

      <div className="mt-8">
        <Suspense fallback={<div className="py-20 text-center text-neutral-400">Loading...</div>}>
          <SearchResults />
        </Suspense>
      </div>
    </div>
  );
}
