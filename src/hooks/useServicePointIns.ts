import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ServicePointIns } from '@/integrations/supabase/schema';

export const useServicePointIns = () => {
  const [servicePoints, setServicePoints] = useState<ServicePointIns[]>([]);
  const [selectedServicePoint, setSelectedServicePoint] = useState<ServicePointIns | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchServicePoints = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('service_points_ins')
          .select('*')
          .eq('enabled', true)
          .order('name', { ascending: true });

        if (error) {
          throw new Error(error.message);
        }

        setServicePoints(data || []);
        
        // Set the first service point as selected if available and no selection exists
        if (data && data.length > 0 && !selectedServicePoint) {
          setSelectedServicePoint(data[0]);
        }
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching service points:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchServicePoints();
  }, []);

  return {
    servicePoints,
    selectedServicePoint,
    setSelectedServicePoint,
    loading,
    error
  };
};
