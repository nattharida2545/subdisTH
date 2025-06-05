
import * as React from 'react';
import { Queue, QueueStatus, QueueTypeEnum } from '@/integrations/supabase/schema';
import { useQueueRealtime } from '@/hooks/useQueueRealtime';
import { queueSupabaseRequest } from '@/utils/requestThrottler';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useOptimizedQueueState');

export const useOptimizedQueueState = () => {
  const [queues, setQueues] = React.useState<Queue[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = React.useState(0);

  // Cache duration - 10 seconds (reduced for better real-time feel)
  const CACHE_DURATION = 10 * 1000;

  const getTodayDate = () => new Date().toISOString().slice(0, 10);

  const fetchQueues = React.useCallback(async (force = false) => {
    const now = Date.now();
    
    // Skip if recently fetched and not forced
    if (!force && now - lastFetchTime < CACHE_DURATION) {
      logger.debug('Skipping fetch - using cached data');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await queueSupabaseRequest(async () => {
        const response = await supabase
          .from('queues')
          .select('*')
          .eq('queue_date', getTodayDate())
          .order('created_at', { ascending: false });
        
        return response;
      });

      if (result.error) {
        throw result.error;
      }

      const typedData = (result.data || []).map(item => ({
        ...item,
        type: item.type as QueueTypeEnum,
        status: item.status as QueueStatus
      }));

      setQueues(typedData);
      setLastFetchTime(now);
      
      logger.info(`Fetched ${result.data?.length || 0} queues for ${getTodayDate()}`);
    } catch (err: unknown) {
      logger.error('Error fetching queues:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch queues');
      toast.error('ไม่สามารถดึงข้อมูลคิวได้');
    } finally {
      setLoading(false);
    }
  }, [lastFetchTime]);

  // Use real-time updates with immediate refresh
  useQueueRealtime({
    onQueueChange: React.useCallback(() => {
      logger.debug('Real-time queue change detected, refreshing data');
      fetchQueues(true); // Force refresh on realtime updates
    }, [fetchQueues]),
    channelName: 'optimized-queue-state',
    enabled: true,
    debounceMs: 100 // Reduced debounce for faster updates
  });

  // Initial fetch
  React.useEffect(() => {
    fetchQueues();
  }, [fetchQueues]);

  const getQueuesByStatus = React.useCallback(async (status: QueueStatus | QueueStatus[]) => {
    try {
      setError(null);

      let query = supabase
        .from('queues')
        .select('*')
        .eq('queue_date', getTodayDate());
        
      if (Array.isArray(status)) {
        query = query.in('status', status);
      } else {
        query = query.eq('status', status);
      }

      const result = await queueSupabaseRequest(async () => {
        const response = await query.order('created_at', { ascending: true });
        return response;
      });

      if (result.error) {
        throw result.error;
      }

      const typedData = (result.data || []).map(item => ({
        ...item,
        type: item.type as QueueTypeEnum,
        status: item.status as QueueStatus
      }));
      
      return typedData;
    } catch (err: unknown) {
      logger.error('Error fetching queues by status:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch queues');
      return [];
    }
  }, []);

  const updateQueueInState = React.useCallback((updatedQueue: Queue) => {
    setQueues(prevQueues => {
      const updated = prevQueues.map(queue => queue.id === updatedQueue.id ? updatedQueue : queue);
      logger.debug(`Updated queue ${updatedQueue.id} in state`);
      return updated;
    });
  }, []);

  return {
    queues,
    loading,
    error,
    fetchQueues,
    getQueuesByStatus,
    updateQueueInState
  };
};
