'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/components/ui/LanguageProvider';
import type { CmsArticle } from '@/types';

interface ArticleContentProps {
  article: CmsArticle;
}

function renderMarkdown(text: string): string {
  return text
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold mt-6 mb-2 text-neutral-900 dark:text-white">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-8 mb-3 text-neutral-900 dark:text-white">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-8 mb-4 text-neutral-900 dark:text-white">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-neutral-700 dark:text-neutral-300">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 list-decimal text-neutral-700 dark:text-neutral-300">$2</li>')
    .replace(/\n\n/g, '</p><p class="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-3">')
    .replace(/\n/g, '<br />');
}

export default function ArticleContent({ article }: ArticleContentProps) {
  const { language } = useLanguage();
  const title = language === 'hi' && article.titleHi ? article.titleHi : article.title;
  const body = language === 'hi' && article.bodyHi ? article.bodyHi : article.body;
  const html = renderMarkdown(body);

  const backUrl = article.section === 'general' ? '/' : `/${article.section}`;

  return (
    <div className="pb-20 md:pb-8">
      <div className="mx-auto max-w-3xl px-4 py-6 md:px-6 md:py-10">
        <Link
          href={backUrl}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
        >
          <ArrowLeft className="h-4 w-4" />
          {language === 'hi' ? 'वापस' : 'Back'}
        </Link>

        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white md:text-3xl">
          {title}
        </h1>

        <div
          className="mt-6 text-base leading-relaxed text-neutral-700 dark:text-neutral-300"
          dangerouslySetInnerHTML={{
            __html: '<p class="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-3">' + html + '</p>',
          }}
        />
      </div>
    </div>
  );
}
