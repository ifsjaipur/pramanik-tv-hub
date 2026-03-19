import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCategoryBySlug } from '@/config/categories';
import { getVideosByCategory } from '@/lib/youtube';
import PaginatedVideoGrid from "@/components/video/PaginatedVideoGrid";

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

interface PageProps {
  params: Promise<{ categorySlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { categorySlug } = await params;
  const category = getCategoryBySlug(categorySlug);
  if (!category) return { title: 'Category Not Found' };

  return {
    title: category.label,
    description: `${category.label} - ${category.labelHi}`,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { categorySlug } = await params;
  const category = getCategoryBySlug(categorySlug);
  if (!category) notFound();

  const videos = await getVideosByCategory(categorySlug);

  return (
    <div className="pb-8">
      {/* Category header */}
      <section className="bg-gradient-to-br from-saffron-50/50 via-white to-white px-4 py-8 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 md:px-6 md:py-12">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white md:text-3xl">
            {category.label}
          </h1>
          <p className="mt-1 text-lg text-neutral-500 dark:text-neutral-400">
            {category.labelHi}
          </p>
        </div>
      </section>

      {/* Videos */}
      <div className="mx-auto max-w-7xl pt-6">
        <PaginatedVideoGrid videos={videos} />
      </div>
    </div>
  );
}
