import type { CategorySlug, ChannelKey } from '@/types';
import { CATEGORIES } from '@/config/categories';

export function categoriseVideo(
  title: string,
  description: string,
  channelKey: ChannelKey
): CategorySlug {
  const text = `${title} ${description}`.toLowerCase();

  const channelDefaults: Record<ChannelKey, CategorySlug> = {
    bestofshankasamadhan: 'shanka-clips',
    shankasamadhan: 'shanka-full',
    jainpathshala: 'kids',
    pramansagarji: 'discourse',
  };

  if (text.includes('live') || text.includes('\u0932\u093E\u0907\u0935')) {
    return 'live';
  }

  if (channelKey !== 'pramansagarji') {
    return channelDefaults[channelKey];
  }

  let bestMatch: CategorySlug = 'discourse';
  let bestScore = 0;

  for (const [, category] of Object.entries(CATEGORIES)) {
    if (!category.channels.includes(channelKey)) continue;

    let score = 0;
    for (const keyword of category.keywords) {
      if (text.includes(keyword.toLowerCase())) {
        score += 1;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = category.slug;
    }
  }

  return bestMatch;
}
