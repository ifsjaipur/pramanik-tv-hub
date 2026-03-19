import type { Channel, ChannelKey } from '@/types';

export const CHANNELS: Record<ChannelKey, Channel> = {
  pramansagarji: {
    key: 'pramansagarji',
    id: process.env.YOUTUBE_CHANNEL_ID_PRAMANSAGARJI ?? '',
    handle: '@pramansagarji',
    name: 'Muni Pramansagar Ji',
    nameHi: '\u092E\u0941\u0928\u093F \u092A\u094D\u0930\u092E\u093E\u0923\u0938\u093E\u0917\u0930 \u091C\u0940',
    description: 'Discourses, Bhawna Yog, Agam Swadhyay and live events',
    descriptionHi: '\u092A\u094D\u0930\u0935\u091A\u0928, \u092D\u093E\u0935\u0928\u093E \u092F\u094B\u0917, \u0906\u0917\u092E \u0938\u094D\u0935\u093E\u0927\u094D\u092F\u093E\u092F \u0914\u0930 \u0932\u093E\u0907\u0935 \u0915\u093E\u0930\u094D\u092F\u0915\u094D\u0930\u092E',
    color: '#E8730A',
    icon: 'Mic',
    priority: 1,
  },
  bestofshankasamadhan: {
    key: 'bestofshankasamadhan',
    id: process.env.YOUTUBE_CHANNEL_ID_BESTOFSHANKA ?? '',
    handle: '@bestofshankasamadhan',
    name: 'Best of Shanka Samadhan',
    nameHi: '\u092C\u0947\u0938\u094D\u091F \u0911\u092B \u0936\u0902\u0915\u093E \u0938\u092E\u093E\u0927\u093E\u0928',
    description: 'Selected highlight clips from Shanka Samadhan episodes',
    descriptionHi: '\u0936\u0902\u0915\u093E \u0938\u092E\u093E\u0927\u093E\u0928 \u0915\u0947 \u091A\u0941\u0928\u093F\u0902\u0926\u093E \u0915\u094D\u0932\u093F\u092A\u094D\u0938',
    color: '#C9932A',
    icon: 'Zap',
    priority: 2,
  },
  shankasamadhan: {
    key: 'shankasamadhan',
    id: process.env.YOUTUBE_CHANNEL_ID_SHANKASAMADHAN ?? '',
    handle: '@shankasamadhan',
    name: 'Shanka Samadhan',
    nameHi: 'शंका समाधान',
    description: 'Full Shanka Samadhan episodes and Q&A sessions',
    descriptionHi: 'शंका समाधान के पूर्ण एपिसोड',
    color: '#B8860B',
    icon: 'MessageCircle',
    priority: 3,
  },
  jainpathshala: {
    key: 'jainpathshala',
    id: process.env.YOUTUBE_CHANNEL_ID_JAINPATHSHALA ?? '',
    handle: '@jainpathshalabypramaniksamooh',
    name: 'Jain Pathshala',
    nameHi: '\u091C\u0948\u0928 \u092A\u093E\u0920\u0936\u093E\u0932\u093E',
    description: 'Animated stories and easy Jain concepts for kids',
    descriptionHi: '\u092C\u091A\u094D\u091A\u094B\u0902 \u0915\u0947 \u0932\u093F\u090F \u090F\u0928\u093F\u092E\u0947\u091F\u0947\u0921 \u0915\u0939\u093E\u0928\u093F\u092F\u093E\u0901 \u0914\u0930 \u091C\u0948\u0928 \u0936\u093F\u0915\u094D\u0937\u093E',
    color: '#1A4E7A',
    icon: 'Palette',
    priority: 4,
    isKids: true,
  },
} as const;

export function getChannelByKey(key: ChannelKey): Channel {
  return CHANNELS[key];
}

export function getChannelBySlug(slug: string): Channel | undefined {
  const entry = Object.entries(CHANNELS).find(
    ([k]) => k === slug || k.replace(/([A-Z])/g, '-$1').toLowerCase() === slug
  );
  return entry ? entry[1] : undefined;
}

export function getAllChannels(): Channel[] {
  return Object.values(CHANNELS).sort((a, b) => a.priority - b.priority);
}
