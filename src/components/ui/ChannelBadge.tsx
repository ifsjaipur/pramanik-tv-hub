import type { ChannelKey } from '@/types';
import { CHANNELS } from '@/config/channels';

interface ChannelBadgeProps {
  channelKey: ChannelKey | string;
  size?: 'sm' | 'md';
}

export default function ChannelBadge({ channelKey, size = 'sm' }: ChannelBadgeProps) {
  const channel = CHANNELS[channelKey as ChannelKey] ?? { name: channelKey, color: "#888" };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      }`}
      style={{
        backgroundColor: `${channel.color}15`,
        color: channel.color,
      }}
    >
      <span
        className={`rounded-full ${size === 'sm' ? 'h-2 w-2' : 'h-2.5 w-2.5'}`}
        style={{ backgroundColor: channel.color }}
      />
      {channel.name}
    </span>
  );
}
