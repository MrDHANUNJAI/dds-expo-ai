import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const hits = new Map<string, RateLimitRecord>();

export function rateLimiter(maxHits = 30, windowSeconds = 60) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const windowMs = windowSeconds * 1000;

    let record = hits.get(ip);
    if (!record || record.resetAt < now) {
      record = { count: 1, resetAt: now + windowMs };
      hits.set(ip, record);
      next();
      return;
    }

    record.count += 1;
    if (record.count > maxHits) {
      res.status(429).json({
        success: false,
        message: 'Too many requests. Please wait a moment before trying again.',
        code: 'RATE_LIMIT_EXCEEDED',
      });
      return;
    }

    next();
  };
}
