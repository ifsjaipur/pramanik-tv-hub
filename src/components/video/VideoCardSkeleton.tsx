export default function VideoCardSkeleton({ variant = 'grid' }: { variant?: 'row' | 'grid' | 'compact' }) {
  const isCompact = variant === 'compact';

  return (
    <div className={`animate-pulse ${isCompact ? 'flex gap-3' : ''}`}>
      <div
        className={`rounded-lg bg-neutral-200 dark:bg-neutral-800 ${
          isCompact ? 'aspect-video w-40 shrink-0' : 'aspect-video w-full'
        }`}
      />
      <div className={`${isCompact ? 'flex-1 py-0.5' : 'mt-2.5'} space-y-2`}>
        <div className="h-4 w-3/4 rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-3 w-1/2 rounded bg-neutral-200 dark:bg-neutral-800" />
      </div>
    </div>
  );
}
