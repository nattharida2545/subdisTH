
import { supabase } from '@/integrations/supabase/client';
import { ServicePoint } from '@/integrations/supabase/schema';

// Cache for service points to avoid repeated database calls
let servicePointsCache: ServicePoint[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Fetch all service points and cache them
async function fetchServicePoints(): Promise<ServicePoint[]> {
  const now = Date.now();
  
  // Use cache if it's still valid
  if (servicePointsCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return servicePointsCache;
  }
  
  try {
    const { data, error } = await supabase
      .from('service_points')
      .select('*')
      .eq('enabled', true)
      .order('code');
    
    if (error) {
      console.error('Error fetching service points:', error);
      return [];
    }
    
    servicePointsCache = data || [];
    cacheTimestamp = now;
    return servicePointsCache;
  } catch (error) {
    console.error('Error fetching service points:', error);
    return [];
  }
}

// Get service point information by ID
export async function getServicePointById(servicePointId: string): Promise<{ code?: string; name?: string } | null> {
  try {
    const servicePoints = await fetchServicePoints();
    const servicePoint = servicePoints.find(sp => sp.id === servicePointId);
    
    if (servicePoint) {
      return {
        // code: servicePoint.code,
        name: servicePoint.name
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting service point by ID:', error);
    return null;
  }
}

// Clear the cache (useful for testing or when service points are updated)
export function clearServicePointCache(): void {
  servicePointsCache = null;
  cacheTimestamp = 0;
}
