export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const originHostname = url.hostname;

    // List of hostnames that should NOT be proxied (internal/system domains)
    const systemHostnames = [
      'tepakiid.weldn-dev-002.workers.dev',
      'staging.weorbit.site',
      'weorbit.site'
    ];

    // If it's a system hostname, we might want to handle it differently 
    // or just let it pass through. For now, we proxy everything to staging 
    // but keep the original hostname in headers.
    
    // Construct the target URL
    const targetUrl = new URL(request.url);
    targetUrl.hostname = env.TARGET_HOSTNAME || 'staging.weorbit.site';

    // Clone the request with the new URL
    const newRequest = new Request(targetUrl, request);

    // Set headers so the backend knows the original domain
    newRequest.headers.set('X-Forwarded-Host', originHostname);
    newRequest.headers.set('X-Original-Hostname', originHostname);
    
    // Optional: Pass the original protocol (http/https)
    newRequest.headers.set('X-Forwarded-Proto', url.protocol.replace(':', ''));

    try {
      const response = await fetch(newRequest);
      
      // We can also modify the response headers here if needed
      // For example, to handle CORS or security headers
      const newResponse = new Response(response.body, response);
      
      return newResponse;
    } catch (e) {
      return new Response('Proxy Error: ' + e.message, { status: 502 });
    }
  }
};
