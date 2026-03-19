'use client';

import Link from 'next/link';
import { FileText } from 'lucide-react';
import { useLanguage } from '@/components/ui/LanguageProvider';
import type { CmsArticle } from '@/types';

interface ArticleCardProps {
  article: CmsArticle;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const { language } = useLanguage();
  const title = language === 'hi' && article.titleHi ? article.titleHi : article.title;
  const body = language === 'hi' && article.bodyHi ? article.bodyHi : article.body;
  const preview = body.replace(/[#*_\[\]()]/g, '').slice(0, 120);

  return (
    <Link
      href={'/read/' + article.slug}
      className="block rounded-xl border border-neutral-200 bg-white p-4 transition-colors hover:border-purple-300 hover:bg-purple-50/50 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-purple-700 dark:hover:bg-purple-900/10"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
          <FileText className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">{title}</h3>
          {preview && (
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">{preview}...</p>
          )}
        </div>
      </div>
    </Link>
  );
}
