class RateLimitMiddleware {
  constructor({ limit, windowMs }) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.requests = new Map(); // In-memory store for request tracking for demonstration purposes only
  }

  async enforceRateLimit(req) {
    const clientId = req.token || req.ip || 'anonymous';

    const now = Date.now();
    const requestLog = this.requests.get(clientId) || [];

    const updatedLog = requestLog.filter(
      (timestamp) => now - timestamp < this.windowMs,
    );

    if (updatedLog.length >= this.limit) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    updatedLog.push(now);
    this.requests.set(clientId, updatedLog);
  }
}

module.exports = RateLimitMiddleware;
