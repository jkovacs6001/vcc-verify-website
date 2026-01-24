type RateLimitEntry = {
  timestamps: number[];
};

const store: Map<string, RateLimitEntry> = new Map();

export function checkRateLimit(params: {
  key: string;
  limit: number;
  windowMs: number;
}): { allowed: boolean; retryAfterMs: number } {
  const { key, limit, windowMs } = params;
  const now = Date.now();
  const windowStart = now - windowMs;

  const entry = store.get(key) ?? { timestamps: [] };
  // Keep only timestamps within the window
  entry.timestamps = entry.timestamps.filter((t) => t >= windowStart);

  if (entry.timestamps.length >= limit) {
    // Oldest relevant attempt inside window determines retry time
    const oldest = entry.timestamps[0];
    const retryAfterMs = windowMs - (now - oldest);
    store.set(key, entry);
    return { allowed: false, retryAfterMs: Math.max(0, retryAfterMs) };
  }

  // Record this attempt and allow
  entry.timestamps.push(now);
  store.set(key, entry);
  return { allowed: true, retryAfterMs: 0 };
}
