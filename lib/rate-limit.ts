/**
 * Simple in-memory rate limiter for API routes.
 * Uses a sliding window counter per IP + endpoint.
 * Entries auto-expire to prevent memory leaks.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}, 5 * 60 * 1000).unref();

/**
 * Check rate limit for a given key.
 * @param ip - Client IP address
 * @param endpoint - Endpoint identifier (e.g., "submit", "search")
 * @param maxRequests - Maximum requests allowed in the window
 * @param windowSeconds - Time window in seconds
 * @returns { success: boolean, remaining: number, resetAt: number }
 */
export function rateLimit(
  ip: string,
  endpoint: string,
  maxRequests: number,
  windowSeconds: number
): { success: boolean; remaining: number; resetAt: number } {
  const key = `${endpoint}:${ip}`;
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    // New window
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  if (entry.count >= maxRequests) {
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { success: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt };
}
