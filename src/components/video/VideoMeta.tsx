import { formatRelativeDate } from '@/lib/formatters';
import { Eye, Calendar, Clock } from 'lucide-react';

interface VideoMetaProps {
  viewCount: string;
  publishedAt: string;
  duration: string;
}

export default function VideoMeta({ viewCount, publishedAt, duration }: VideoMetaProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
      <span className="flex items-center gap-1">
        <Eye className="h-3.5 w-3.5" />
        {viewCount} views
      </span>
      <span className="flex items-center gap-1">
        <Calendar className="h-3.5 w-3.5" />
        {formatRelativeDate(publishedAt)}
      </span>
      {duration && (
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {duration}
        </span>
      )}
    </div>
  );
}
