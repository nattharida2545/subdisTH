
import { supabase } from '@/integrations/supabase/client';
import { Queue, QueueTypeEnum } from '@/integrations/supabase/schema';
import { QueueAlgorithmType } from '@/utils/queueAlgorithms';
import { mapToQueueObject } from './queueMapping';
import { applyQueueAlgorithm } from './algorithms';
import { ensureQueueTypeEnum } from './queueTypes';

// Function to get next queue based on algorithm type
export const getNextQueue = async (
  servicePointId: string | null,
  algorithm: QueueAlgorithmType
): Promise<Queue | null> => {
  try {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Get waiting queues for today
    let query = supabase
      .from('queues')
      .select(`
        *,
        queue_type:type
      `)
      .eq('queue_date', today)
      .eq('status', 'WAITING');
    
    // Filter by service point capabilities if servicePointId is provided
    if (servicePointId) {
      // Get service point capabilities
      const { data: servicePointCapabilities } = await supabase
        .from('service_point_queue_types')
        .select(`
          queue_type_id,
          queue_type:queue_types(code)
        `)
        .eq('service_point_id', servicePointId);
      
      if (servicePointCapabilities && servicePointCapabilities.length > 0) {
        const validTypes = servicePointCapabilities.map(cap => 
          cap.queue_type?.code || ''
        ).filter(code => code !== '');
        
        if (validTypes.length > 0) {
          query = query.in('type', validTypes);
        }
      }
    }
    
    const { data: waitingQueues, error } = await query;
    
    if (error) {
      throw error;
    }
    
    if (!waitingQueues || waitingQueues.length === 0) {
      return null; // No waiting queues
    }

    // Get queue types to access priority information
    const { data: queueTypesData } = await supabase
      .from('queue_types')
      .select('id, code, priority, algorithm');

    const queueTypeMap = queueTypesData ? 
      queueTypesData.reduce((map: Record<string, any>, qt) => {
        map[qt.code] = qt;
        return map;
      }, {}) : {};
    
    // Apply queue algorithm based on the selected type
    const nextQueue = await applyQueueAlgorithm(waitingQueues, queueTypeMap, algorithm);
    
    return nextQueue;
    
  } catch (error) {
    console.error('Error getting next queue:', error);
    return null;
  }
};
