
import * as React from 'react';
import { toast } from 'sonner';
import { createLogger } from '@/utils/logger';

const logger = createLogger('PharmacyErrorHandler');

export type PharmacyErrorType = 
  | 'FETCH_ERROR'
  | 'ACTION_ERROR'
  | 'SERVICE_ERROR'
  | 'VALIDATION_ERROR'
  | 'NETWORK_ERROR';

export interface PharmacyError {
  type: PharmacyErrorType;
  message: string;
  originalError?: unknown;
  context?: Record<string, any>;
}

const ERROR_MESSAGES: Record<PharmacyErrorType, string> = {
  FETCH_ERROR: 'ไม่สามารถดึงข้อมูลคิวเภสัชกรรมได้',
  ACTION_ERROR: 'ไม่สามารถดำเนินการได้',
  SERVICE_ERROR: 'ไม่สามารถให้บริการได้',
  VALIDATION_ERROR: 'ข้อมูลไม่ถูกต้อง',
  NETWORK_ERROR: 'ปัญหาการเชื่อมต่อเครือข่าย'
};

export const usePharmacyErrorHandler = () => {
  const [error, setError] = React.useState<PharmacyError | null>(null);

  const handleError = React.useCallback((
    type: PharmacyErrorType,
    originalError: unknown,
    context?: Record<string, any>
  ) => {
    const message = ERROR_MESSAGES[type];
    const pharmacyError: PharmacyError = {
      type,
      message,
      originalError,
      context
    };

    setError(pharmacyError);
    logger.error(`Pharmacy ${type}:`, originalError, context);
    toast.error(message);

    return pharmacyError;
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  const withErrorHandling = React.useCallback(<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    errorType: PharmacyErrorType,
    context?: Record<string, any>
  ): ((...args: Parameters<T>) => Promise<ReturnType<T> | null>) => {
    return async (...args: Parameters<T>) => {
      try {
        clearError();
        return await fn(...args);
      } catch (err) {
        handleError(errorType, err, { ...context, args });
        return null;
      }
    };
  }, [handleError, clearError]);

  return {
    error,
    handleError,
    clearError,
    withErrorHandling
  };
};
