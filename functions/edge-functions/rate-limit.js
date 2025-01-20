export default async function handler(request, context) {
  const ip = context.ip;
  const userAgent = request.headers.get('user-agent') || '';
  const origin = request.headers.get('origin') || '';

  // Retrieve sensitive data from environment variables
  const allowedOrigins = (context.env.ALLOWED_ORIGINS || '').split(',');
  const apiKey = context.env.API_KEY;

  const timestamp = Date.now();

  // 1. Validate Origin
  if (!allowedOrigins.includes(origin)) {
    return new Response(
      JSON.stringify({ error: 'Access denied: Invalid origin' }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // 2. Validate API Key
  const requestApiKey = request.headers.get('x-api-key');
  if (requestApiKey !== apiKey) {
    return new Response(
      JSON.stringify({ error: 'Access denied: Invalid API key' }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // 3. Block Known Bot Patterns
  if (isSuspiciousUserAgent(userAgent)) {
    return new Response(
      JSON.stringify({ error: 'Access denied: Suspicious user agent' }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // 4. Implement Rate Limiting
  const cacheKey = `ratelimit_${ip}_${userAgent.slice(0, 32)}`;
  let rateLimit = await context.store.get(cacheKey);

  if (!rateLimit) {
    rateLimit = {
      count: 0,
      timestamp,
      violations: 0,
    };
  } else {
    rateLimit = JSON.parse(rateLimit);
  }

  // Reset counter if outside the time window (60 seconds)
  if (timestamp - rateLimit.timestamp > 60000) {
    rateLimit.count = 0;
    rateLimit.timestamp = timestamp;
  }

  rateLimit.count++;

  const maxRequests = rateLimit.violations > 3 ? 2 : 5;

  if (rateLimit.count > maxRequests) {
    rateLimit.violations++;
    const backoffTime = Math.min(60 * Math.pow(2, rateLimit.violations), 3600);

    await context.store.put(cacheKey, JSON.stringify(rateLimit), {
      ttl: backoffTime,
    });

    return new Response(
      JSON.stringify({
        error: 'Rate limit exceeded',
        retryAfter: backoffTime,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': backoffTime.toString(),
        },
      }
    );
  }

  // Store the updated rate limit data
  await context.store.put(cacheKey, JSON.stringify(rateLimit), { ttl: 60 });

  // 5. Proceed with the chatbot logic or return success
  return new Response(
    JSON.stringify({ success: 'Request successful' }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': origin, // Allow origin for CORS
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
    }
  );
}

// Helper function to identify suspicious user agents
function isSuspiciousUserAgent(ua) {
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /curl/i,
    /postman/i,
    /insomnia/i,
  ];

  return suspiciousPatterns.some((pattern) => pattern.test(ua));
}
