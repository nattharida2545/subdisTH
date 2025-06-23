
import { z } from 'zod';

// Phone number validation for Thailand
export const phoneSchema = z.string()
  .regex(/^0[0-9]{9}$/, 'หมายเลขโทรศัพท์ไม่ถูกต้อง (ต้องเป็น 10 หลัก ขึ้นต้นด้วย 0)')
  .transform(val => val.trim());

// Email validation
export const emailSchema = z.string()
  .email('รูปแบบอีเมลไม่ถูกต้อง')
  .max(255, 'อีเมลยาวเกินไป');

// Patient ID validation
export const patientIdSchema = z.string()
  .min(1, 'รหัสผู้ป่วยไม่สามารถว่างได้')
  .max(50, 'รหัสผู้ป่วยยาวเกินไป')
  .regex(/^[A-Za-z0-9-_]+$/, 'รหัสผู้ป่วยสามารถใช้ได้เฉพาะตัวอักษร ตัวเลข - และ _');

// Name validation
export const nameSchema = z.string()
  .min(1, 'ชื่อไม่สามารถว่างได้')
  .max(255, 'ชื่อยาวเกินไป')
  .trim();

// Sanitize HTML to prevent XSS
export const sanitizeHtml = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

// Validate and sanitize text input
export const sanitizeInput = (input: string, maxLength: number = 1000): string => {
  if (!input) return '';
  return sanitizeHtml(input).substring(0, maxLength);
};

// Rate limiting helper
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();
  
  constructor(private maxAttempts: number = 5, private windowMs: number = 15 * 60 * 1000) {}
  
  isAllowed(key: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(key);
    
    if (!record || now > record.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + this.windowMs });
      return true;
    }
    
    if (record.count >= this.maxAttempts) {
      return false;
    }
    
    record.count++;
    return true;
  }
  
  reset(key: string): void {
    this.attempts.delete(key);
  }
}

export const loginRateLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes
