import { useCallback } from 'react';
import { QueueIns } from '@/integrations/supabase/schema';
import { supabase } from '@/integrations/supabase/client';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useInsServicePointActions');

export const useInsServicePointActions = (
  queues: QueueIns[]
) => {
  // Get intelligent service point suggestion for an INS queue
  const getIntelligentServicePointSuggestion = useCallback(async (queueTypeCode: string) => {
    try {
      // Get all service points for INS
      const { data: servicePoints, error } = await supabase
        .from('service_points_ins')
        .select('*')
        .eq('enabled', true);

      if (error) {
        logger.error('Error fetching INS service points:', error);
        return null;
      }
      
      // If we have service points, return the first one
      // In a real implementation, we would filter by queue type compatibility
      if (servicePoints && servicePoints.length > 0) {
        return servicePoints[0];
      }

      return null;
    } catch (error) {
      logger.error('Error in getIntelligentServicePointSuggestion INS:', error);
      return null;
    }
  }, []);

  // Get next INS queue to call for a specific service point
  const getNextQueueToCall = useCallback(async (servicePointId: string) => {
    try {
      // Get waiting INS queues for this service point
      const waitingQueues = queues.filter(q => 
        q.status === 'WAITING' && 
        (q.service_point_id === servicePointId || !q.service_point_id)
      );

      if (waitingQueues.length === 0) {
        return null;
      }

      // Return the first waiting queue (FIFO approach)
      return waitingQueues[0] || null;
    } catch (error) {
      logger.error('Error getting next INS queue:', error);
      return null;
    }
  }, [queues]);

  return {
    getIntelligentServicePointSuggestion,
    getNextQueueToCall
  };
};
