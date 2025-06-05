
import * as React from 'react';
import { PharmacyQueue } from '../types';
import { usePharmacyState } from './usePharmacyState';
import { usePharmacyDataFetch } from './usePharmacyDataFetch';
import { usePharmacyErrorHandler } from './usePharmacyErrorHandler';
import { createLogger } from '@/utils/logger';

const logger = createLogger('PharmacyQueueFetch');

export const usePharmacyQueueFetch = () => {
  const {
    queues,
    activeQueue,
    loading,
    setQueues,
    setActiveQueue,
    setLoading
  } = usePharmacyState();

  const { error } = usePharmacyErrorHandler();
  const { fetchPharmacyQueues, findActiveServiceQueue } = usePharmacyDataFetch();

  const refreshQueues = React.useCallback(async (): Promise<PharmacyQueue[]> => {
    try {
      setLoading(true);
      logger.info('Refreshing pharmacy queues');

      const queueData = await fetchPharmacyQueues();
      // Ensure we always return an array
      const safeQueueData = Array.isArray(queueData) ? queueData : [];

      setQueues(safeQueueData);
      
      // Set active queue if there's one already in service
      const inServiceQueue = findActiveServiceQueue(safeQueueData);
      setActiveQueue(inServiceQueue);
      
      logger.info(`Refreshed ${safeQueueData.length} pharmacy queues`);
      return safeQueueData;
    } catch (err) {
      logger.error('Error refreshing queues:', err);
      // Return empty array on error to prevent iteration issues
      setQueues([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [fetchPharmacyQueues, findActiveServiceQueue, setQueues, setActiveQueue, setLoading]);

  // Initial fetch only
  React.useEffect(() => {
    refreshQueues();
  }, [refreshQueues]);

  return {
    queues: Array.isArray(queues) ? queues : [],
    activeQueue,
    setActiveQueue,
    loading,
    error: error?.message || null,
    fetchPharmacyQueues: refreshQueues
  };
};
