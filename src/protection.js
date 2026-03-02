import { RateLimiterMemory } from 'rate-limiter-flexible';
import { isbot } from 'isbot';

// For production, consider using RateLimiterRedis instead of Memory
const httpLimiter = new RateLimiterMemory({
    points: 50, // 50 requests
    duration: 10, // per 10 seconds
});

export const wsLimiter = new RateLimiterMemory({
    points: 5, // 5 upgrade attempts
    duration: 2, // per 2 seconds
});

// 2. Bot Detection Function
export function isBadBot(req) {
    const ua = req.headers['user-agent'] || '';
    // isbot identifies if it's a bot.
    // Here we allow known crawlers and block the rest if necessary.
    const botDetected = isbot(ua);
    const isSearchEngine = /googlebot|bingbot|yandex|baiduspider/i.test(ua);

    return botDetected && !isSearchEngine;
}

// 3. Middleware for Express/HTTP
export function securityMiddleware() {
  return async (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;

    try {
        // Block Bots
        if (isBadBot(req)) {
            return res.status(403).json({ error: 'Bots are not allowed.' });
        }

        // Apply Rate Limit
        await httpLimiter.consume(ip);
        
        next();
    } catch (rejectPromise) {
        // If we reach here, the rate limit has been exceeded
        res.status(429).json({ error: 'Too many requests.' });
    }
  }
}