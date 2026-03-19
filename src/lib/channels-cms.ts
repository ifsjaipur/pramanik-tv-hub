import 'server-only';
import type { Channel, ChannelKey, CmsChannel } from '@/types';
import { CHANNELS } from '@/config/channels';
import { getChannels as getCmsChannels } from './cms';

function cmsToChannel(cms: CmsChannel): Channel {
  return {
    key: cms.key as ChannelKey,
    id: cms.id,
    handle: cms.handle,
    name: cms.name,
    nameHi: cms.nameHi,
    description: cms.description,
    descriptionHi: cms.descriptionHi,
    color: cms.color,
    icon: cms.icon,
    priority: cms.priority,
    isKids: cms.isKids,
  };
}

export async function getAllChannelsWithCms(): Promise<Channel[]> {
  const base = Object.values(CHANNELS) as Channel[];
  try {
    const cmsChannels = await getCmsChannels();
    const baseKeys = new Set(base.map((c) => c.key));
    const extra = cmsChannels
      .filter((c) => !baseKeys.has(c.key as ChannelKey))
      .map(cmsToChannel);
    return [...base, ...extra].sort((a, b) => a.priority - b.priority);
  } catch {
    return base.sort((a, b) => a.priority - b.priority);
  }
}

export async function getChannelByKeyWithCms(key: string): Promise<Channel | null> {
  if (key in CHANNELS) return CHANNELS[key as ChannelKey];
  try {
    const cmsChannels = await getCmsChannels();
    const found = cmsChannels.find((c) => c.key === key);
    return found ? cmsToChannel(found) : null;
  } catch {
    return null;
  }
}
