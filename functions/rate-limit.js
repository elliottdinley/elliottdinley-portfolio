export default async function handler(request, context) {
  const ip = context.ip;
  const userAgent = request.headers.get('user-agent') || '';
  const timestamp = Date.now();

  // Block known bot patterns
  if (isSuspiciousUserAgent(userAgent)) {
    return new Response(JSON.stringify({ error: 'Access denied' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Create a unique cache key combining IP and truncated UA
  const cacheKey = `ratelimit_${ip}_${userAgent.slice(0, 32)}`;
  
  let rateLimit = await context.store.get(cacheKey);
  
  if (!rateLimit) {
    rateLimit = { 
      count: 0, 
      timestamp,
      violations: 0 
    };
  } else {
    rateLimit = JSON.parse(rateLimit);
  }

  // Reset counter if outside window
  if (timestamp - rateLimit.timestamp > 60000) {
    rateLimit.count = 0;
    rateLimit.timestamp = timestamp;
  }

  rateLimit.count++;

  // Implement progressive backoff for repeated violations
  const maxRequests = rateLimit.violations > 3 ? 2 : 5;
  
  if (rateLimit.count > maxRequests) {
    rateLimit.violations++;
    
    // Calculate backoff time based on violations
    const backoffTime = Math.min(60 * Math.pow(2, rateLimit.violations), 3600);
    
    await context.store.put(cacheKey, JSON.stringify(rateLimit), {
      ttl: backoffTime
    });

    return new Response(JSON.stringify({ 
      error: 'Rate limit exceeded',
      retryAfter: backoffTime
    }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': backoffTime.toString()
      }
    });
  }

  await context.store.put(cacheKey, JSON.stringify(rateLimit), {
    ttl: 60
  });

  return context.next();
}

function isSuspiciousUserAgent(ua) {
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /curl/i,
    /postman/i,
    /insomnia/i
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(ua));
} 