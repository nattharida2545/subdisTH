
import { useState, useEffect } from 'react';
import { ServicePointQueueType } from '@/integrations/supabase/schema';
import { fetchAllServicePointQueueTypes } from './service';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useAllServicePointQueueTypes');

export const useAllServicePointQueueTypes = () => {
  const [mappings, setMappings] = useState<ServicePointQueueType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllMappings = async () => {
    try {
      setLoading(true);
      setError(null);
      logger.debug('Fetching all service point queue type mappings');
      
      const data = await fetchAllServicePointQueueTypes();
      setMappings(data);
      
      logger.debug(`Successfully loaded ${data.length} total mappings`);
    } catch (err: any) {
      logger.error('Error fetching all service point queue type mappings:', err);
      setError(err.message || 'Failed to fetch service point queue type mappings');
      setMappings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllMappings();
  }, []);

  return {
    mappings,
    loading,
    error,
    refetch: fetchAllMappings
  };
};
