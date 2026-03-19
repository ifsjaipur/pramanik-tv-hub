import Redis from 'ioredis';

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;
  const url = process.env.REDIS_URL;
  if (!url) return null;
  redis = new Redis(url, {
    maxRetriesPerRequest: 1,
    connectTimeout: 5000,
    lazyConnect: true,
  });
  redis.on('error', () => {
    // Silently handle connection errors — cache is non-critical
  });
  return redis;
}

export const CACHE_KEYS = {
  channelVideos: (channelKey: string) => `channel:${channelKey}:videos`,
  videoDetail: (videoId: string) => `video:${videoId}`,
  allVideos: () => 'all:videos',
  liveStreams: () => 'live:streams',
  upcomingStreams: () => 'upcoming:streams',
  searchIndex: () => 'search:index',
};

export const CACHE_TTL = {
  pramansagarji: 21600,        // 6 hours
  bestofshankasamadhan: 21600,
  shankasamadhan: 21600,
  jainpathshala: 43200,        // 12 hours (less frequent uploads)
  liveStreams: 600,             // 10 min
  upcomingStreams: 1800,        // 30 min
  searchIndex: 21600,
  videoDetail: 86400,          // 24 hours
  default: 21600,              // 6 hours
} as const;

export async function getCachedOrFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number
): Promise<T> {
  const client = getRedis();
  let cached: string | null = null;

  if (client) {
    try {
      cached = await client.get(key);
      if (cached) {
        // Return cached data immediately, but also store in stale key for fallback
        return JSON.parse(cached) as T;
      }
    } catch {
      // Redis unavailable — fall through to fetch
    }
  }

  try {
    const fresh = await fetchFn();

    if (client) {
      try {
        // Save with TTL for normal cache
        await client.setex(key, ttl, JSON.stringify(fresh));
        // Also save a stale copy with 7-day TTL as fallback
        await client.setex(`stale:${key}`, 604800, JSON.stringify(fresh));
      } catch {
        // Redis write failed — non-critical
      }
    }

    return fresh;
  } catch (fetchError) {
    // YouTube API failed — try stale fallback from Redis
    if (client) {
      try {
        const stale = await client.get(`stale:${key}`);
        if (stale) {
          console.warn(`[cache] API failed for "${key}", serving stale data`);
          return JSON.parse(stale) as T;
        }
      } catch {
        // Redis also failed
      }
    }
    // No stale data available — rethrow
    throw fetchError;
  }
}

export async function invalidateCache(pattern?: string): Promise<void> {
  const client = getRedis();
  if (!client) return;

  if (pattern) {
    try {
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await Promise.all(keys.map((k) => client.del(k)));
      }
    } catch {
      // Non-critical
    }
  }
}

// Expose Redis client for CMS (persistent data, not cache)
export function getRedisClient(): Redis | null {
  return getRedis();
}

// Set a CMS key without TTL (persistent, not evictable with volatile-lru)
export async function cmsSet(key: string, value: unknown): Promise<void> {
  const client = getRedis();
  if (!client) throw new Error('Redis not available');
  await client.set(key, JSON.stringify(value));
}

// Get a CMS key
export async function cmsGet<T>(key: string): Promise<T | null> {
  const client = getRedis();
  if (!client) return null;
  const data = await client.get(key);
  return data ? (JSON.parse(data) as T) : null;
}

// Delete a CMS key
export async function cmsDel(key: string): Promise<void> {
  const client = getRedis();
  if (!client) return;
  await client.del(key);
}

// Get all CMS keys matching a pattern
export async function cmsKeys(pattern: string): Promise<string[]> {
  const client = getRedis();
  if (!client) return [];
  return client.keys(pattern);
}
