interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (req: Request) => string; // Custom key generator
  skipSuccessfulRequests?: boolean; // Skip rate limiting for successful requests
  skipFailedRequests?: boolean; // Skip rate limiting for failed requests
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

class RateLimiter {
  private store = new Map<string, { count: number; resetTime: number }>();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  private generateKey(req: Request): string {
    if (this.config.keyGenerator) {
      return this.config.keyGenerator(req);
    }

    // Default key generation based on IP and user agent
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const url = new URL(req.url).pathname;
    
    return `${ip}:${userAgent}:${url}`;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.store.entries()) {
      if (now > value.resetTime) {
        this.store.delete(key);
      }
    }
  }

  async checkLimit(req: Request): Promise<RateLimitResult> {
    this.cleanup();
    
    const key = this.generateKey(req);
    const now = Date.now();
    const windowStart = now - (now % this.config.windowMs);
    const resetTime = windowStart + this.config.windowMs;

    const current = this.store.get(key);
    
    if (!current || now > current.resetTime) {
      // First request in this window
      this.store.set(key, { count: 1, resetTime });
      return {
        success: true,
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests - 1,
        reset: resetTime,
      };
    }

    if (current.count >= this.config.maxRequests) {
      // Rate limit exceeded
      return {
        success: false,
        limit: this.config.maxRequests,
        remaining: 0,
        reset: current.resetTime,
        retryAfter: Math.ceil((current.resetTime - now) / 1000),
      };
    }

    // Increment count
    current.count++;
    this.store.set(key, current);

    return {
      success: true,
      limit: this.config.maxRequests,
      remaining: this.config.maxRequests - current.count,
      reset: current.resetTime,
    };
  }

  async increment(req: Request): Promise<void> {
    const key = this.generateKey(req);
    const current = this.store.get(key);
    
    if (current) {
      current.count++;
      this.store.set(key, current);
    }
  }
}

// Create different rate limiters for different endpoints
export const rateLimiters = {
  // Strict rate limiting for AI endpoints (expensive operations)
  ai: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 requests per minute
    keyGenerator: (req) => {
      const ip = req.headers.get('x-forwarded-for') || 'unknown';
      const url = new URL(req.url).pathname;
      return `ai:${ip}:${url}`;
    },
  }),

  // Moderate rate limiting for user data endpoints
  user: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 requests per minute
    keyGenerator: (req) => {
      const ip = req.headers.get('x-forwarded-for') || 'unknown';
      const url = new URL(req.url).pathname;
      return `user:${ip}:${url}`;
    },
  }),

  // Loose rate limiting for general API endpoints
  general: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
    keyGenerator: (req) => {
      const ip = req.headers.get('x-forwarded-for') || 'unknown';
      const url = new URL(req.url).pathname;
      return `general:${ip}:${url}`;
    },
  }),

  // Very strict rate limiting for authentication endpoints
  auth: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 requests per 15 minutes
    keyGenerator: (req) => {
      const ip = req.headers.get('x-forwarded-for') || 'unknown';
      const url = new URL(req.url).pathname;
      return `auth:${ip}:${url}`;
    },
  }),
};

// Rate limiting middleware for API routes
export async function rateLimitMiddleware(
  req: Request,
  limiter: RateLimiter = rateLimiters.general
): Promise<Response | null> {
  const result = await limiter.checkLimit(req);

  if (!result.success) {
    return new Response(
      JSON.stringify({
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: result.retryAfter,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': result.limit.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': result.reset.toString(),
          'Retry-After': result.retryAfter?.toString() || '60',
        },
      }
    );
  }

  // Add rate limit headers to successful responses
  const response = new Response();
  response.headers.set('X-RateLimit-Limit', result.limit.toString());
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
  response.headers.set('X-RateLimit-Reset', result.reset.toString());

  return null; // Continue with the request
}

// Utility function to get appropriate rate limiter based on endpoint
export function getRateLimiter(pathname: string): RateLimiter {
  if (pathname.startsWith('/api/ai-chat') || pathname.startsWith('/api/suggest-budget')) {
    return rateLimiters.ai;
  }
  
  if (pathname.startsWith('/api/user/')) {
    return rateLimiters.user;
  }
  
  if (pathname.startsWith('/api/auth/') || pathname.includes('login') || pathname.includes('signup')) {
    return rateLimiters.auth;
  }
  
  return rateLimiters.general;
} 