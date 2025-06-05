
import { useCallback } from 'react';
import { Queue } from '@/integrations/supabase/schema';
import { supabase } from '@/integrations/supabase/client';
import { ServicePointCapability } from '@/utils/queueAlgorithms';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useServicePointActions');

export const useServicePointActions = (
  queues: Queue[],
  sortQueues: (queues: Queue[], servicePointCapabilities: ServicePointCapability[], selectedServicePointId?: string) => Queue[]
) => {
  // Get intelligent service point suggestion for a queue
  const getIntelligentServicePointSuggestion = useCallback(async (queueTypeCode: string) => {
    try {
      // Get service points that can handle this queue type
      const { data: servicePointQueueTypes, error } = await supabase
        .from('service_point_queue_types')
        .select(`
          service_point_id,
          service_point:service_points!inner(*)
        `)
        .eq('service_point.enabled', true);

      if (error) {
        logger.error('Error fetching service point mappings:', error);
        return null;
      }

      // Get queue type ID
      const { data: queueTypes, error: queueTypeError } = await supabase
        .from('queue_types')
        .select('id')
        .eq('code', queueTypeCode)
        .single();

      if (queueTypeError || !queueTypes) {
        logger.error('Error fetching queue type:', queueTypeError);
        return null;
      }

      // Find service points that can handle this queue type
      const compatibleServicePoints = servicePointQueueTypes?.filter(spqt => 
        spqt.service_point_id === queueTypes.id
      );

      if (compatibleServicePoints && compatibleServicePoints.length > 0) {
        // Return the first compatible service point
        return compatibleServicePoints[0].service_point;
      }

      return null;
    } catch (error) {
      logger.error('Error in getIntelligentServicePointSuggestion:', error);
      return null;
    }
  }, []);

  // Get next queue to call for a specific service point
  const getNextQueueToCall = useCallback(async (servicePointId: string) => {
    try {
      // Get waiting queues for this service point
      const waitingQueues = queues.filter(q => 
        q.status === 'WAITING' && 
        (q.service_point_id === servicePointId || !q.service_point_id)
      );

      if (waitingQueues.length === 0) {
        return null;
      }

      // Use the sorting algorithm to get the next queue
      const sortedQueues = sortQueues(waitingQueues, [], servicePointId);
      return sortedQueues[0] || null;
    } catch (error) {
      logger.error('Error getting next queue:', error);
      return null;
    }
  }, [queues, sortQueues]);

  return {
    getIntelligentServicePointSuggestion,
    getNextQueueToCall
  };
};
