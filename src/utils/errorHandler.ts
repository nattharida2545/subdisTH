
import { toast } from 'sonner';
import { createLogger } from './logger';

const logger = createLogger('ErrorHandler');

/**
 * Error types for better categorization
 */
export enum ErrorType {
  VALIDATION = 'validation',
  DATABASE = 'database',
  NETWORK = 'network',
  GENERAL = 'general'
}

/**
 * Error messages mapped by type and code
 */
const errorMessages: Record<ErrorType, Record<string, string>> = {
  validation: {
    'missing-patient': 'กรุณาเลือกผู้ป่วยหรือสร้างผู้ป่วยใหม่',
    'missing-phone': 'กรุณากรอกเบอร์โทรศัพท์',
    'missing-name': 'กรุณากรอกชื่อ-นามสกุลผู้ป่วย'
  },
  database: {
    'insert-failed': 'ไม่สามารถบันทึกข้อมูลได้',
    'query-failed': 'ไม่สามารถดึงข้อมูลได้',
    'not-found': 'ไม่พบข้อมูลที่ต้องการ'
  },
  network: {
    'connection-failed': 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
    'timeout': 'การเชื่อมต่อใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง'
  },
  general: {
    'unknown': 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ'
  }
};

/**
 * Handle errors with consistent logging and user feedback
 */
export const handleError = (
  error: unknown,
  type: ErrorType = ErrorType.GENERAL,
  code: string = 'unknown',
  context: Record<string, any> = {}
): void => {
  // Get error message
  const message = errorMessages[type][code] || errorMessages.general.unknown;
  
  // Log the error
  logger.error(`${type} error (${code}):`, error, context);
  
  // Show toast message
  toast.error(message);
};

/**
 * Wrapper for async functions to handle their errors
 */
export const withErrorHandling = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  type: ErrorType = ErrorType.GENERAL,
  code: string = 'unknown',
  context: Record<string, any> = {}
): ((...args: Parameters<T>) => Promise<ReturnType<T> | null>) => {
  return async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error, type, code, { ...context, args });
      return null;
    }
  };
};

export default {
  handleError,
  withErrorHandling,
  ErrorType
};
