
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ServicePoint } from '@/integrations/supabase/schema';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useServicePoints');

export const useServicePoints = () => {
  const [servicePoints, setServicePoints] = useState<ServicePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServicePoints = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('service_points')
        .select('*')
        .order('code', { ascending: true });

      if (error) {
        throw error;
      }

      setServicePoints(data || []);
      logger.debug(`Fetched ${data?.length || 0} service points`);
    } catch (err: any) {
      logger.error('Error fetching service points:', err);
      setError(err.message || 'Failed to fetch service points');
      toast.error('ไม่สามารถดึงข้อมูลจุดบริการได้');
    } finally {
      setLoading(false);
    }
  };

  const saveServicePoint = async (servicePoint: Partial<ServicePoint>) => {
    try {
      // Ensure required fields are present when creating a new service point
      if (!servicePoint.id) {
        if (!servicePoint.code || !servicePoint.name) {
          throw new Error('Service point code and name are required');
        }
      }
      
      const { data, error } = await supabase
        .from('service_points')
        .upsert({
          id: servicePoint.id || undefined,
          code: servicePoint.code || '',  // Ensure required fields are included
          name: servicePoint.name || '',   // Ensure required fields are included
          location: servicePoint.location,
          enabled: servicePoint.enabled !== undefined ? servicePoint.enabled : true
        })
        .select();

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error('No data returned after saving service point');
      }

      await fetchServicePoints(); // Refresh the list
      return data[0] as ServicePoint;
    } catch (err: any) {
      logger.error('Error saving service point:', err);
      toast.error('ไม่สามารถบันทึกข้อมูลจุดบริการได้');
      throw err;
    }
  };

  const deleteServicePoint = async (id: string) => {
    try {
      const { error } = await supabase
        .from('service_points')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setServicePoints(prev => prev.filter(sp => sp.id !== id));
      toast.success('ลบจุดบริการเรียบร้อยแล้ว');
      return true;
    } catch (err: any) {
      logger.error('Error deleting service point:', err);
      toast.error('ไม่สามารถลบจุดบริการได้');
      return false;
    }
  };

  useEffect(() => {
    fetchServicePoints();
  }, []);

  return {
    servicePoints,
    loading,
    error,
    fetchServicePoints,
    saveServicePoint,
    deleteServicePoint
  };
};
