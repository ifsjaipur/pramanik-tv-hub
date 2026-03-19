import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CHANNELS } from '@/config/channels';
import { getVideosByChannel } from '@/lib/youtube';
import type { ChannelKey } from '@/types';
import PaginatedVideoGrid from "@/components/video/PaginatedVideoGrid";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ channelSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { channelSlug } = await params;
  const channel = CHANNELS[channelSlug as ChannelKey];
  if (!channel) return { title: 'Channel Not Found' };

  return {
    title: channel.name,
    description: channel.description,
  };
}

export default async function ChannelPage({ params }: PageProps) {
  const { channelSlug } = await params;
  const channel = CHANNELS[channelSlug as ChannelKey];
  if (!channel) notFound();

  const videos = await getVideosByChannel(channelSlug as ChannelKey);

  return (
    <div className="pb-8">
      {/* Channel header */}
      <section
        className="px-4 py-8 md:px-6 md:py-12"
        style={{
          background: `linear-gradient(135deg, ${channel.color}10, ${channel.color}05)`,
        }}
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full text-2xl text-white"
              style={{ backgroundColor: channel.color }}
            >
              {channel.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white md:text-3xl">
                {channel.name}
              </h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {channel.nameHi}
              </p>
            </div>
          </div>
          <p className="mt-3 max-w-2xl text-neutral-600 dark:text-neutral-300">
            {channel.description}
          </p>
        </div>
      </section>

      {/* Videos */}
      <div className="mx-auto max-w-7xl pt-6">
        <PaginatedVideoGrid videos={videos} showChannel={false} />
      </div>
    </div>
  );
}
