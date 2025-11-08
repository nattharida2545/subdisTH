import { supabase } from '@/integrations/supabase/client';
import { SettingsData } from '@/integrations/supabase/database.types';
import { getOrFetchClientIP, normalizeIP } from './clientIPDetector';

/**
 * ดึงรายการ IP ที่อนุญาตจากฐานข้อมูล
 */
export const getAllowedIPs = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('value_text')
      .eq('category', 'IP');

    if (error) {
      console.error('Error fetching allowed IPs:', error);
      return [];
    }

    if (!data || data.length === 0) {
      console.warn('No IP restrictions found in settings');
      return [];
    }

    // รวม IP ทั้งหมดจาก value_text และแยกด้วย comma หรือ newline
    const allowedIPs: string[] = [];
    data.forEach((setting: SettingsData) => {
      if (setting.value_text) {
        // แยก IP ด้วย comma, semicolon, หรือ newline
        const ips = setting.value_text
          .split(/[,;\n]/)
          .map(ip => ip.trim())
          .filter(ip => ip.length > 0);
        allowedIPs.push(...ips);
      }
    });

    return allowedIPs;
  } catch (error) {
    console.error('Exception in getAllowedIPs:', error);
    return [];
  }
};

/**
 * ตรวจสอบว่า IP ตรงกับ pattern หรือไม่ (รองรับ wildcard และ CIDR)
 */
const matchIPPattern = (clientIP: string, pattern: string): boolean => {
  // ถ้าเป็น IP เดียวกันทุกประการ
  if (clientIP === pattern) {
    return true;
  }

  // รองรับ wildcard เช่น 192.168.1.*
  if (pattern.includes('*')) {
    const regexPattern = pattern
      .replace(/\./g, '\\.')
      .replace(/\*/g, '\\d+');
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(clientIP);
  }

  // รองรับ CIDR notation เช่น 192.168.1.0/24
  if (pattern.includes('/')) {
    return matchCIDR(clientIP, pattern);
  }

  return false;
};

/**
 * ตรวจสอบว่า IP อยู่ใน CIDR range หรือไม่
 */
const matchCIDR = (ip: string, cidr: string): boolean => {
  const [range, bits] = cidr.split('/');
  const mask = ~(2 ** (32 - parseInt(bits)) - 1);
  
  const ipToInt = (ipStr: string): number => {
    return ipStr.split('.').reduce((int, oct) => (int << 8) + parseInt(oct), 0) >>> 0;
  };

  return (ipToInt(ip) & mask) === (ipToInt(range) & mask);
};

/**
 * ดึง IP address ของ client
 */
export const getClientIP = async (): Promise<string | null> => {
  const ip = await getOrFetchClientIP({
    useEdgeFunction: false,
    useExternalService: true // ใช้ external service เพื่อดึง IP โดยตรง
  });

  if (ip) {
    return normalizeIP(ip);
  }

  console.warn('Client IP detection failed');
  return null;
};

/**
 * ตรวจสอบว่า IP ปัจจุบันได้รับอนุญาตให้เข้าถึงหรือไม่
 */
export const isIPAllowed = async (clientIP: string | null): Promise<boolean> => {
  if (!clientIP) {
    console.warn('No client IP provided for validation');
    return false;
  }

  const allowedIPs = await getAllowedIPs();

  // ถ้าไม่มีการตั้งค่า IP restriction ให้อนุญาตทั้งหมด
  if (allowedIPs.length === 0) {
    console.info('No IP restrictions configured, allowing all access');
    return true;
  }

  // ตรวจสอบว่า IP ตรงกับรายการที่อนุญาตหรือไม่
  const isAllowed = allowedIPs.some(pattern => matchIPPattern(clientIP, pattern));

  if (!isAllowed) {
    console.warn(`IP ${clientIP} is not in the allowed list`);
  }

  return isAllowed;
};

/**
 * ตรวจสอบการเข้าถึง admin path
 */
export const checkAdminAccess = async (): Promise<{
  allowed: boolean;
  message?: string;
}> => {
  const clientIP = await getClientIP();

  if (!clientIP) {
    return {
      allowed: false,
      message: 'ไม่สามารถตรวจสอบ IP address ได้ กรุณาติดต่อผู้ดูแลระบบ'
    };
  }

  const allowed = await isIPAllowed(clientIP);

  if (!allowed) {
    return {
      allowed: false,
      message: `การเข้าถึงถูกปิดกั้น: IP address (${clientIP}) ไม่ได้รับอนุญาตให้เข้าถึงหน้า Admin`
    };
  }

  return {
    allowed: true
  };
};

/**
 * Higher-order component สำหรับป้องกันการเข้าถึง admin routes
 */
export const withIPRestriction = async (
  callback: () => void,
  onDenied?: (message: string) => void
): Promise<void> => {
  const { allowed, message } = await checkAdminAccess();

  if (allowed) {
    callback();
  } else if (onDenied && message) {
    onDenied(message);
  }
};
