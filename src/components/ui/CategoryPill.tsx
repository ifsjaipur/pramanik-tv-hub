import Link from 'next/link';
import type { CategorySlug } from '@/types';
import { getCategoryBySlug } from '@/config/categories';
import { useLanguage } from './LanguageProvider';

interface CategoryPillProps {
  slug: CategorySlug;
  active?: boolean;
}

export default function CategoryPill({ slug, active = false }: CategoryPillProps) {
  const category = getCategoryBySlug(slug);
  const { language } = useLanguage();
  if (!category) return null;

  const label = language === 'hi' ? category.labelHi : category.label;

  return (
    <Link
      href={`/category/${slug}`}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
        active
          ? 'border-saffron-500 bg-saffron-500 text-white'
          : 'border-neutral-200 bg-white text-neutral-700 hover:border-saffron-300 hover:text-saffron-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-saffron-500'
      }`}
    >
      {label}
    </Link>
  );
}
