import DOMPurify from 'dompurify';

export class DataSanitizer {
  // Sanitize HTML content to prevent XSS
  static sanitizeHtml(dirty: string): string {
    if (typeof window === 'undefined') {
      // Server-side fallback
      return dirty
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<[^>]*>/g, '')
        .trim();
    }
    
    return DOMPurify.sanitize(dirty, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
      ALLOWED_ATTR: []
    });
  }

  // Sanitize patient data
  static sanitizePatientData(data: any): any {
    if (!data || typeof data !== 'object') return data;
    
    const sanitized: any = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        // Remove potentially dangerous characters
        sanitized[key] = value
          .replace(/[<>]/g, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+=/gi, '')
          .trim()
          .substring(0, key === 'notes' ? 1000 : 255);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizePatientData(value);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }

  // Sanitize phone numbers
  static sanitizePhone(phone: string): string {
    if (!phone) return '';
    
    // Keep only digits and common phone characters
    return phone
      .replace(/[^\d\-\+\(\)\s]/g, '')
      .trim()
      .substring(0, 20);
  }

  // Sanitize email addresses
  static sanitizeEmail(email: string): string {
    if (!email) return '';
    
    // Basic email sanitization
    return email
      .toLowerCase()
      .replace(/[^a-z0-9@\.\-_]/g, '')
      .trim()
      .substring(0, 255);
  }

  // Sanitize database query parameters
  static sanitizeQueryParam(param: any): string {
    if (param === null || param === undefined) return '';
    
    return String(param)
      .replace(/['"\\;]/g, '') // Remove SQL injection characters
      .replace(/\b(DROP|DELETE|INSERT|UPDATE|CREATE|ALTER|EXEC|UNION|SELECT)\b/gi, '') // Remove SQL keywords
      .trim()
      .substring(0, 100);
  }

  // Validate and sanitize medication data
  static sanitizeMedicationData(data: any): any {
    if (!data || typeof data !== 'object') return data;
    
    return {
      ...data,
      name: data.name ? String(data.name).substring(0, 255).trim() : '',
      code: data.code ? String(data.code).replace(/[^A-Za-z0-9\-_]/g, '').substring(0, 50) : '',
      dosage: data.dosage ? String(data.dosage).substring(0, 100).trim() : '',
      instructions: data.instructions ? this.sanitizeHtml(String(data.instructions)).substring(0, 500) : '',
      notes: data.notes ? this.sanitizeHtml(String(data.notes)).substring(0, 1000) : ''
    };
  }
}

// Rate limiting for sensitive operations
export class RateLimiter {
  private static attempts: Map<string, { count: number; resetTime: number }> = new Map();
  
  static isAllowed(key: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
    const now = Date.now();
    const record = this.attempts.get(key);
    
    if (!record || now > record.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (record.count >= maxAttempts) {
      return false;
    }
    
    record.count++;
    return true;
  }
  
  static reset(key: string): void {
    this.attempts.delete(key);
  }

  static getRemainingTime(key: string): number {
    const record = this.attempts.get(key);
    if (!record) return 0;
    
    const now = Date.now();
    return Math.max(0, record.resetTime - now);
  }
}

export const authRateLimiter = new RateLimiter();
