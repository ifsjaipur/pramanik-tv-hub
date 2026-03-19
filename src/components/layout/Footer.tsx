import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-50 pb-8 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-saffron-500 text-white font-bold text-sm">
                P
              </div>
              <span className="text-lg font-bold text-neutral-900 dark:text-white">
                Pramanik
              </span>
            </div>
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
              Video platform for Muni Pramansagar Ji Maharaj&apos;s teachings
            </p>
          </div>

          {/* Categories */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-white">Categories</h3>
            <ul className="space-y-2 text-sm text-neutral-500 dark:text-neutral-400">
              <li><Link href="/category/discourse" className="hover:text-saffron-500">Discourses</Link></li>
              <li><Link href="/category/bhawna-yog" className="hover:text-saffron-500">Bhawna Yog</Link></li>
              <li><Link href="/category/swadhyay" className="hover:text-saffron-500">Agam Swadhyay</Link></li>
              <li><Link href="/category/shanka-clips" className="hover:text-saffron-500">Q&A Highlights</Link></li>
            </ul>
          </div>

          {/* Channels */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-white">Channels</h3>
            <ul className="space-y-2 text-sm text-neutral-500 dark:text-neutral-400">
              <li><Link href="/channel/pramansagarji" className="hover:text-saffron-500">Muni Pramansagar Ji</Link></li>
              <li><Link href="/channel/bestofshankasamadhan" className="hover:text-saffron-500">Best of Shanka Samadhan</Link></li>
              <li><Link href="/channel/shankasamadhan" className="hover:text-saffron-500">Shanka Samadhan</Link></li>
              <li><Link href="/channel/jainpathshala" className="hover:text-saffron-500">Jain Pathshala</Link></li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-white">More</h3>
            <ul className="space-y-2 text-sm text-neutral-500 dark:text-neutral-400">
              <li><Link href="/kids" className="hover:text-saffron-500">Kids Section</Link></li>
              <li><Link href="/search" className="hover:text-saffron-500">Search</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-neutral-200 pt-6 text-center text-xs text-neutral-400 dark:border-neutral-800">
          <p>Pramanik Samooh &mdash; A voluntary initiative for Muni Pramansagar Ji Maharaj</p>
          <p className="mt-1">All videos are hosted and streamed by YouTube</p>
        </div>
      </div>
    </footer>
  );
}
