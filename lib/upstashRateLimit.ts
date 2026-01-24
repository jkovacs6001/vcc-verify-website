import { Ratelimit } from "@upstash/ratelimit";
import type { Duration } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let ratelimit: Ratelimit | null = null;

function init(limit: number, window: Duration): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  if (!ratelimit) {
    const redis = Redis.fromEnv();
    ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, window),
      prefix: "vcc",
    });
  }
  return ratelimit;
}

export async function checkUpstashLimit(params: {
  key: string;
  limit: number;
  window: Duration; // e.g., "15 m"
}): Promise<{ allowed: boolean; retryAfterMs: number; usedFallback: boolean }> {
  const { key, limit, window } = params;
  const rl = init(limit, window);
  if (!rl) return { allowed: true, retryAfterMs: 0, usedFallback: true };
  const res = await rl.limit(key);
  if (res.success) return { allowed: true, retryAfterMs: 0, usedFallback: false };
  const retryAfterMs = Math.max(0, res.reset - Date.now());
  return { allowed: false, retryAfterMs, usedFallback: false };
}
