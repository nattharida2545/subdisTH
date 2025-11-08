import { supabase } from '@/integrations/supabase/client';

/**
 * ดึง IP address ของ client จาก Supabase Edge Function
 * หมายเหตุ: ต้องสร้าง Edge Function 'get-client-ip' ก่อน (ดูใน SUPABASE_IP_FUNCTION_EXAMPLE.md)
 */
export const fetchClientIPFromEdgeFunction = async (): Promise<string | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-client-ip');

    if (error) {
      console.error('Error fetching client IP from edge function:', error);
      return null;
    }

    if (data && data.ip) {
      sessionStorage.setItem('clientIP', data.ip);
      (window as any).__CLIENT_IP__ = data.ip;
      console.log('Client IP detected from edge function:', data.ip);
      return data.ip;
    }

    return null;
  } catch (error) {
    console.error('Exception in fetchClientIPFromEdgeFunction:', error);
    return null;
  }
};

/**
 * ดึง IP จาก external service (ใช้สำหรับ development/testing เท่านั้น)
 * ⚠️ WARNING: ไม่ควรใช้ใน production เพราะพึ่งพา third-party service
 */
export const fetchClientIPFromExternal = async (): Promise<string | null> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    
    if (data && data.ip) {
      sessionStorage.setItem('clientIP', data.ip);
      (window as any).__CLIENT_IP__ = data.ip;
      console.log('Client IP detected from external service:', data.ip);
      return data.ip;
    }

    return null;
  } catch (error) {
    console.error('Exception in fetchClientIPFromExternal:', error);
    return null;
  }
};

/**
 * ดึง IP address ของ client
 * ลำดับความสำคัญ:
 * 1. ดึงจาก sessionStorage (ถ้ามี)
 * 2. ดึงจาก Edge Function (แนะนำสำหรับ production)
 * 3. ดึงจาก External Service (สำหรับ development/testing)
 */
export const fetchClientIP = async (options?: {
  useEdgeFunction?: boolean;
  useExternalService?: boolean;
}): Promise<string | null> => {
  const {
    useEdgeFunction = true,
    useExternalService = false
  } = options || {};

  // ลองดึงจาก cache ก่อน
  const cachedIP = sessionStorage.getItem('clientIP') || (window as any).__CLIENT_IP__;
  if (cachedIP) {
    console.log('Using cached client IP:', cachedIP);
    return cachedIP;
  }

  // ลองดึงจาก Edge Function
  if (useEdgeFunction) {
    const ip = await fetchClientIPFromEdgeFunction();
    if (ip) return ip;
  }

  // ถ้า Edge Function ไม่สำเร็จ และอนุญาตให้ใช้ external service
  if (useExternalService) {
    console.warn('Falling back to external IP service (not recommended for production)');
    const ip = await fetchClientIPFromExternal();
    if (ip) return ip;
  }

  console.error('Failed to detect client IP');
  return null;
};

/**
 * ดึง IP ที่เก็บไว้ หรือ fetch ใหม่ถ้ายังไม่มี
 */
export const getOrFetchClientIP = async (options?: {
  forceRefresh?: boolean;
  useEdgeFunction?: boolean;
  useExternalService?: boolean;
}): Promise<string | null> => {
  const { forceRefresh = false, ...fetchOptions } = options || {};

  // ถ้าไม่ต้องการ force refresh ให้ลองดึงจาก cache ก่อน
  if (!forceRefresh) {
    const cachedIP = sessionStorage.getItem('clientIP') || (window as any).__CLIENT_IP__;
    if (cachedIP) {
      return cachedIP;
    }
  }

  // Fetch IP ใหม่
  return await fetchClientIP(fetchOptions);
};

/**
 * ล้างค่า IP ที่เก็บไว้
 */
export const clearCachedIP = (): void => {
  sessionStorage.removeItem('clientIP');
  delete (window as any).__CLIENT_IP__;
  console.log('Cached client IP cleared');
};

/**
 * ตรวจสอบว่า IP เป็นรูปแบบที่ถูกต้องหรือไม่
 */
export const isValidIP = (ip: string): boolean => {
  // IPv4 pattern
  const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  
  // IPv6 pattern (simplified)
  const ipv6Pattern = /^([0-9a-fA-F]{0,4}:){7}[0-9a-fA-F]{0,4}$/;

  if (ipv4Pattern.test(ip)) {
    // ตรวจสอบว่าแต่ละ octet อยู่ในช่วง 0-255
    const octets = ip.split('.');
    return octets.every(octet => {
      const num = parseInt(octet, 10);
      return num >= 0 && num <= 255;
    });
  }

  return ipv6Pattern.test(ip);
};

/**
 * แปลง IPv6 localhost เป็น IPv4
 */
export const normalizeIP = (ip: string): string => {
  if (ip === '::1' || ip === '::ffff:127.0.0.1') {
    return '127.0.0.1';
  }
  return ip;
};
