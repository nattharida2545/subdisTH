
/**
 * Security headers configuration
 * This can be used with frameworks like Express or integrated with serverless functions
 */
export const securityHeaders = {
  // Protect against clickjacking
  'X-Frame-Options': 'DENY',
  
  // Help prevent XSS attacks
  'X-XSS-Protection': '1; mode=block',
  
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Strict Content Security Policy
  'Content-Security-Policy': `
    default-src 'self';
    script-src 'self' https://cdn.gpteng.co https://lkclreldnbejfubzhube.supabase.co https://storage.googleapis.com 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: blob: https://lkclreldnbejfubzhube.supabase.co;
    font-src 'self';
    connect-src 'self' https://lkclreldnbejfubzhube.supabase.co wss://lkclreldnbejfubzhube.supabase.co;
    frame-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    block-all-mixed-content;
    upgrade-insecure-requests;
  `.replace(/\s+/g, ' ').trim(),
  
  // Referrer Policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions Policy
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self), interest-cohort=()'
};

// Helper function for serverless functions
export const appendSecurityHeaders = (headers: Record<string, string>) => {
  return {
    ...headers,
    ...securityHeaders
  };
};
