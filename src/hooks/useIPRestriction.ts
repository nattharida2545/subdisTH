import { useState, useEffect } from 'react';
import { checkAdminAccess, getClientIP } from '@/utils/security/ipRestriction';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface UseIPRestrictionReturn {
  isChecking: boolean;
  isAllowed: boolean | null;
  clientIP: string | null;
  checkAccess: () => Promise<boolean>;
}

/**
 * Hook สำหรับตรวจสอบการจำกัดการเข้าถึงด้วย IP
 * ใช้สำหรับป้องกันการเข้าถึงหน้า Admin
 */
export const useIPRestriction = (options?: {
  autoCheck?: boolean;
  redirectOnDenied?: boolean;
  redirectPath?: string;
}): UseIPRestrictionReturn => {
  const {
    autoCheck = true,
    redirectOnDenied = true,
    redirectPath = '/'
  } = options || {};

  const [isChecking, setIsChecking] = useState(false);
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);
  const [clientIP, setClientIP] = useState<string | null>(null);
  const navigate = useNavigate();

  const checkAccess = async (): Promise<boolean> => {
    setIsChecking(true);
    
    try {
      const ip = await getClientIP();
      setClientIP(ip);

      const { allowed, message } = await checkAdminAccess();
      setIsAllowed(allowed);

      if (!allowed) {
        toast.error(message || 'การเข้าถึงถูกปิดกั้น');
        
        if (redirectOnDenied) {
          setTimeout(() => {
            navigate(redirectPath, { replace: true });
          }, 2000);
        }
      }

      return allowed;
    } catch (error) {
      console.error('Error checking IP restriction:', error);
      setIsAllowed(false);
      toast.error('เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์การเข้าถึง');
      return false;
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    if (autoCheck) {
      checkAccess();
    }
  }, [autoCheck]);

  return {
    isChecking,
    isAllowed,
    clientIP,
    checkAccess
  };
};
