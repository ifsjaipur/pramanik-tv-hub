import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold text-saffron-500">404</h1>
      <p className="mt-4 text-xl font-medium text-neutral-900 dark:text-white">
        Page Not Found
      </p>
      <p className="mt-2 text-neutral-500 dark:text-neutral-400">
        The page you are looking for does not exist.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-saffron-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-saffron-600"
      >
        Go Home
      </Link>
    </div>
  );
}
