import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ServicePoint, ServicePointIns } from '@/integrations/supabase/schema';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useServicePointsIns');

export const useServicePointsIns = () => {
  const [servicePointsIns, setServicePointsIns] = useState<ServicePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServicePointsIns = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('service_points_ins')
        .select('*')
        .order('code', { ascending: true });

      if (error) {
        throw error;
      }

      setServicePointsIns(data || []);
      logger.debug(`Fetched ${data?.length || 0} INS service points`);
    } catch (err: any) {
      logger.error('Error fetching INS service points:', err);
      setError(err.message || 'Failed to fetch INS service points');
      toast.error('ไม่สามารถดึงข้อมูลจุดบริการ INS ได้');
    } finally {
      setLoading(false);
    }
  };

  const saveServicePointIns = async (servicePoint: Partial<ServicePointIns>) => {
    try {
      // Ensure required fields are present when creating a new service point
      if (!servicePoint.id) {
        if (!servicePoint.code || !servicePoint.name) {
          throw new Error('Service point code and name are required');
        }
      }
      
      const { data, error } = await supabase
        .from('service_points_ins')
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
        throw new Error('No data returned after saving INS service point');
      }

      await fetchServicePointsIns(); // Refresh the list
      return data[0] as ServicePointIns;
    } catch (err: any) {
      logger.error('Error saving INS service point:', err);
      toast.error('ไม่สามารถบันทึกข้อมูลจุดบริการ INS ได้');
      throw err;
    }
  };

  const deleteServicePointIns = async (id: string) => {
    try {
      const { error } = await supabase
        .from('service_points_ins')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setServicePointsIns(prev => prev.filter(sp => sp.id !== id));
      toast.success('ลบจุดบริการ INS เรียบร้อยแล้ว');
      return true;
    } catch (err: any) {
      logger.error('Error deleting INS service point:', err);
      toast.error('ไม่สามารถลบจุดบริการ INS ได้');
      return false;
    }
  };

  useEffect(() => {
    fetchServicePointsIns();
  }, []);

  return {
    servicePointsIns,
    loading,
    error,
    fetchServicePointsIns,
    saveServicePointIns,
    deleteServicePointIns
  };
};
