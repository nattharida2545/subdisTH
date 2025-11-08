
/**
 * Security headers configuration for API calls and responses
 */
export const securityHeaders = {
  // Protect against clickjacking
  'X-Frame-Options': 'DENY',
  
  // Help prevent XSS attacks
  'X-XSS-Protection': '1; mode=block',
  
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Referrer Policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Content Security Policy
  'Content-Security-Policy': `
    default-src 'self';
    script-src 'self' https://yiquudnrheitmcnwowlh.supabase.co 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: blob: https://yiquudnrheitmcnwowlh.supabase.co;
    font-src 'self';
    connect-src 'self' https://yiquudnrheitmcnwowlh.supabase.co wss://lkclreldnbejfubzhube.supabase.co;
    frame-src 'none';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
  `.replace(/\s+/g, ' ').trim(),
  
  // Permissions Policy
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};

// Helper function for API calls
export const getSecureHeaders = (additionalHeaders: Record<string, string> = {}) => {
  return {
    ...securityHeaders,
    ...additionalHeaders,
    'Content-Type': 'application/json',
  };
};

// CSRF token generation and validation
export class CSRFProtection {
  private static tokenKey = 'csrf_token';
  
  static generateToken(): string {
    const token = Array.from(crypto.getRandomValues(new Uint8Array(32)), 
      b => b.toString(16).padStart(2, '0')).join('');
    sessionStorage.setItem(this.tokenKey, token);
    return token;
  }
  
  static getToken(): string | null {
    return sessionStorage.getItem(this.tokenKey);
  }
  
  static validateToken(token: string): boolean {
    const storedToken = this.getToken();
    return storedToken === token && token.length === 64;
  }
  
  static clearToken(): void {
    sessionStorage.removeItem(this.tokenKey);
  }
}

// Secure API wrapper with automatic security headers
export class SecureApiClient {
  static async request(url: string, options: RequestInit = {}): Promise<Response> {
    const csrfToken = CSRFProtection.getToken() || CSRFProtection.generateToken();
    
    const secureOptions: RequestInit = {
      ...options,
      headers: {
        ...getSecureHeaders(),
        'X-CSRF-Token': csrfToken,
        ...(options.headers || {})
      },
      credentials: 'same-origin', // Include cookies for authentication
    };

    // Add request timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      const response = await fetch(url, {
        ...secureOptions,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Check for security headers in response
      if (!response.headers.get('X-Content-Type-Options')) {
        console.warn('Response missing security headers');
      }
      
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }
}
