import type { HomeRowConfig } from '@/types';

export const HOME_ROWS: HomeRowConfig[] = [
  {
    id: 'live_now',
    label: 'Live Now',
    labelHi: '\u0905\u092D\u0940 \u0932\u093E\u0907\u0935',
    type: 'live',
    channels: ['pramansagarji'],
    showWhenEmpty: false,
  },
  {
    id: 'latest_discourses',
    label: 'Latest Discourses',
    labelHi: '\u0928\u0935\u0940\u0928\u0924\u092E \u092A\u094D\u0930\u0935\u091A\u0928',
    type: 'category',
    category: 'discourse',
    limit: 12,
  },
  {
    id: 'bhawna_yog',
    label: 'Bhawna Yog',
    labelHi: '\u092D\u093E\u0935\u0928\u093E \u092F\u094B\u0917',
    type: 'category',
    category: 'bhawna_yog',
    limit: 12,
  },
  {
    id: 'shanka_highlights',
    label: 'Shanka Samadhan \u2014 Highlights',
    labelHi: '\u0936\u0902\u0915\u093E \u0938\u092E\u093E\u0927\u093E\u0928 \u2014 \u091A\u0941\u0928\u093F\u0902\u0926\u093E',
    type: 'channel',
    channel: 'bestofshankasamadhan',
    limit: 12,
  },
  {
    id: 'swadhyay',
    label: 'Agam Swadhyay',
    labelHi: '\u0906\u0917\u092E \u0938\u094D\u0935\u093E\u0927\u094D\u092F\u093E\u092F',
    type: 'category',
    category: 'swadhyay',
    limit: 12,
  },
  {
    id: 'kids',
    label: 'Jain Pathshala \u2014 For Kids',
    labelHi: '\u091C\u0948\u0928 \u092A\u093E\u0920\u0936\u093E\u0932\u093E \u2014 \u092C\u091A\u094D\u091A\u094B\u0902 \u0915\u0947 \u0932\u093F\u090F',
    type: 'channel',
    channel: 'jainpathshala',
    limit: 12,
  },
];
