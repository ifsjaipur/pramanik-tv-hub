'use client';

import { FileText, Headphones } from 'lucide-react';
import { useLanguage } from '@/components/ui/LanguageProvider';
import ArticleCard from '@/components/article/ArticleCard';
import AudioPlayer from '@/components/audio/AudioPlayer';
import type { CmsArticle, CmsAudioTrack } from '@/types';

interface SectionContentProps {
  type: 'articles' | 'audio';
  sectionLabel: string;
  sectionLabelHi: string;
  articles?: CmsArticle[];
  audioTracks?: CmsAudioTrack[];
}

export default function SectionContent({ type, sectionLabel, sectionLabelHi, articles = [], audioTracks = [] }: SectionContentProps) {
  const { language } = useLanguage();

  if (type === 'articles' && articles.length > 0) {
    return (
      <div className="px-4 pt-6 md:px-6">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="h-5 w-5 text-saffron-500 dark:text-saffron-400" />
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
            {language === 'hi' ? sectionLabelHi : sectionLabel}
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    );
  }

  if (type === 'audio' && audioTracks.length > 0) {
    return (
      <div className="px-4 pt-6 md:px-6">
        <div className="flex items-center gap-2 mb-3">
          <Headphones className="h-5 w-5 text-saffron-500 dark:text-saffron-400" />
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
            {language === 'hi' ? sectionLabelHi : sectionLabel}
          </h2>
        </div>
        <AudioPlayer tracks={audioTracks} />
      </div>
    );
  }

  return null;
}
