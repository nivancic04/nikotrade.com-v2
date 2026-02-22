type RateLimitBucket = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  key: string;
  maxRequests: number;
  windowMs: number;
};

type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
  remaining: number;
};

type RateLimitStore = Map<string, RateLimitBucket>;

const RATE_LIMIT_STORE_KEY = Symbol.for("nikotrade.rateLimitStore");

function getRateLimitStore(): RateLimitStore {
  const globalObject = globalThis as typeof globalThis & {
    [RATE_LIMIT_STORE_KEY]?: RateLimitStore;
  };

  if (!globalObject[RATE_LIMIT_STORE_KEY]) {
    globalObject[RATE_LIMIT_STORE_KEY] = new Map<string, RateLimitBucket>();
  }

  return globalObject[RATE_LIMIT_STORE_KEY];
}

function cleanupExpiredBuckets(store: RateLimitStore, now: number) {
  for (const [bucketKey, bucket] of store.entries()) {
    if (bucket.resetAt <= now) {
      store.delete(bucketKey);
    }
  }
}

export function resolveClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const [firstIp] = forwardedFor.split(",");
    const normalized = firstIp?.trim();
    if (normalized) return normalized;
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  return "unknown-ip";
}

export function applyRateLimit(options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const store = getRateLimitStore();

  cleanupExpiredBuckets(store, now);

  const existing = store.get(options.key);
  if (!existing || existing.resetAt <= now) {
    store.set(options.key, {
      count: 1,
      resetAt: now + options.windowMs,
    });

    return {
      allowed: true,
      retryAfterSeconds: Math.ceil(options.windowMs / 1000),
      remaining: Math.max(options.maxRequests - 1, 0),
    };
  }

  existing.count += 1;
  const remaining = Math.max(options.maxRequests - existing.count, 0);
  const retryAfterSeconds = Math.max(Math.ceil((existing.resetAt - now) / 1000), 1);

  if (existing.count > options.maxRequests) {
    return {
      allowed: false,
      retryAfterSeconds,
      remaining: 0,
    };
  }

  return {
    allowed: true,
    retryAfterSeconds,
    remaining,
  };
}

