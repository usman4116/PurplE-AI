/**
 * Simple in-memory sliding-window rate limiter.
 *
 * Good enough for a single-server / Vercel deployment. For multi-instance
 * production you'd swap this for a Redis-backed limiter (e.g. @upstash/ratelimit).
 */

interface RateLimitEntry {
  /** Timestamps (ms) of requests inside the current window. */
  timestamps: number[];
}

/** key → entry map */
const store = new Map<string, RateLimitEntry>();

// Periodically purge stale entries so the map doesn't grow unbounded.
const CLEANUP_INTERVAL_MS = 60_000; // 1 minute

let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function ensureCleanup(windowMs: number) {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      // Drop timestamps older than the largest window we've seen.
      entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);
      if (entry.timestamps.length === 0) {
        store.delete(key);
      }
    }
  }, CLEANUP_INTERVAL_MS);

  // Allow Node to exit even if this timer is still running.
  if (cleanupTimer && typeof cleanupTimer === "object" && "unref" in cleanupTimer) {
    cleanupTimer.unref();
  }
}

/**
 * Check whether a request identified by `key` is within rate limits.
 *
 * @param key      - Unique identifier (e.g. IP, userId, "login:user@example.com")
 * @param limit    - Maximum number of requests allowed in the window
 * @param windowMs - Window size in milliseconds
 * @returns `{ success, remaining }` — `success` is `false` when rate-limited
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { success: boolean; remaining: number } {
  ensureCleanup(windowMs);

  const now = Date.now();

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Evict timestamps outside the current window.
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= limit) {
    return { success: false, remaining: 0 };
  }

  entry.timestamps.push(now);
  return { success: true, remaining: limit - entry.timestamps.length };
}
