import type { CategoryConfig, CategorySlug, ChannelKey } from '@/types';

export const CATEGORIES: Record<string, CategoryConfig> = {
  discourse: {
    slug: 'discourse',
    label: 'Discourses',
    labelHi: '\u092A\u094D\u0930\u0935\u091A\u0928',
    icon: 'BookOpen',
    channels: ['pramansagarji'] as ChannelKey[],
    keywords: ['pravachan', 'discourse', '\u092A\u094D\u0930\u0935\u091A\u0928', 'updesh'],
  },
  bhawna_yog: {
    slug: 'bhawna-yog',
    label: 'Bhawna Yog',
    labelHi: '\u092D\u093E\u0935\u0928\u093E \u092F\u094B\u0917',
    icon: 'Heart',
    channels: ['pramansagarji'] as ChannelKey[],
    keywords: ['bhawna', 'bhavna', 'yog', 'yoga', '\u092D\u093E\u0935\u0928\u093E'],
  },
  swadhyay: {
    slug: 'swadhyay',
    label: 'Agam Swadhyay',
    labelHi: '\u0906\u0917\u092E \u0938\u094D\u0935\u093E\u0927\u094D\u092F\u093E\u092F',
    icon: 'BookMarked',
    channels: ['pramansagarji'] as ChannelKey[],
    keywords: ['swadhyay', 'agam', 'aagam', '\u0938\u094D\u0935\u093E\u0927\u094D\u092F\u093E\u092F', '\u0906\u0917\u092E'],
  },
  shanka_samadhan_clips: {
    slug: 'shanka-clips',
    label: 'Q&A Highlights',
    labelHi: '\u0936\u0902\u0915\u093E \u0938\u092E\u093E\u0927\u093E\u0928',
    icon: 'Zap',
    channels: ['bestofshankasamadhan'] as ChannelKey[],
    keywords: ['shanka', 'samadhan', 'question', 'answer', '\u0936\u0902\u0915\u093E', 'best of'],
  },
  shanka_samadhan_full: {
    slug: 'shanka-full',
    label: 'Shanka Samadhan',
    labelHi: 'शंका समाधान (पूर्ण)',
    icon: 'MessageCircle',
    channels: ['shankasamadhan'] as ChannelKey[],
    keywords: ['shanka', 'samadhan', 'question', 'answer', 'शंका', 'full'],
  },
  live: {
    slug: 'live',
    label: 'Live Events',
    labelHi: '\u0932\u093E\u0907\u0935 \u0915\u093E\u0930\u094D\u092F\u0915\u094D\u0930\u092E',
    icon: 'Radio',
    channels: ['pramansagarji'] as ChannelKey[],
    keywords: ['live', 'event', 'paryushan', 'paryusana', '\u0932\u093E\u0907\u0935'],
  },
  kids: {
    slug: 'kids',
    label: 'Jain Pathshala',
    labelHi: '\u091C\u0948\u0928 \u092A\u093E\u0920\u0936\u093E\u0932\u093E',
    icon: 'Star',
    channels: ['jainpathshala'] as ChannelKey[],
    keywords: ['kids', 'children', 'animated', 'story', 'pathshala', '\u092C\u091A\u094D\u091A\u0947'],
  },
} as const;

export function getCategoryBySlug(slug: string): CategoryConfig | undefined {
  return Object.values(CATEGORIES).find((c) => c.slug === slug);
}

export function getAllCategories(): CategoryConfig[] {
  return Object.values(CATEGORIES);
}

export function getCategorySlugs(): CategorySlug[] {
  return Object.values(CATEGORIES).map((c) => c.slug);
}
