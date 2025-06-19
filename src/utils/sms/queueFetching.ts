
import { supabase } from '@/integrations/supabase/client';
import { Queue, ServicePoint, Patient } from '@/integrations/supabase/schema';
import { createLogger } from '@/utils/logger';

const logger = createLogger('queueFetching');

export const getNextQueuesPerServicePoint = async (): Promise<{ servicePoint: ServicePoint; queues: Queue[]; patients: Patient[] }[]> => {
  try {
    // Get all service points
    const { data: servicePoints, error: spError } = await supabase
      .from('service_points')
      .select('*')
      .eq('enabled', true);

    if (spError) throw spError;

    if (!servicePoints || servicePoints.length === 0) {
      return [];
    }

    const results = [];

    for (const servicePoint of servicePoints) {
      // Get waiting queues for this service point (today only)
      const today = new Date().toISOString().split('T')[0];
      
      const { data: queues, error: queueError } = await supabase
        .from('queues')
        .select(`
          *,
          patients (*)
        `)
        .eq('status', 'WAITING')
        .eq('queue_date', today)
        .or(`service_point_id.eq.${servicePoint.id},service_point_id.is.null`)
        .is('paused_at', null)
        .order('created_at', { ascending: true })
        .limit(3);

      if (queueError) {
        logger.error(`Error fetching queues for service point ${servicePoint.name}:`, queueError);
        continue;
      }

      if (queues && queues.length > 0) {
        // Extract patients from the queues
        const patients = queues.map(q => q.patients).filter(Boolean) as Patient[];
        
        results.push({
          servicePoint,
          queues: queues as Queue[],
          patients
        });
      }
    }

    return results;
  } catch (error) {
    logger.error('Error getting next queues per service point:', error);
    return [];
  }
};
