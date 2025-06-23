import { supabase } from '@/integrations/supabase/client';
import { Queue, ServicePoint, Patient } from '@/integrations/supabase/schema';
import { createLogger } from '@/utils/logger';

const logger = createLogger('queueFetching');

export const getNext3WaitingQueues = async (): Promise<{ queue: Queue; patient: Patient }[]> => {
  try {
    // Get today's date
    const today = new Date().toISOString().split('T')[0];
    
    // Get the next 3 waiting queues globally, ordered by creation time
    const { data: queues, error: queueError } = await supabase
      .from('queues')
      .select(`
        *,
        patients (*)
      `)
      .eq('status', 'WAITING')
      .eq('queue_date', today)
      .is('paused_at', null)
      .order('created_at', { ascending: true })
      .limit(3);

    if (queueError) {
      logger.error('Error fetching next 3 waiting queues:', queueError);
      return [];
    }

    if (!queues || queues.length === 0) {
      logger.info('No waiting queues found');
      return [];
    }

    // Map queues with their patients
    const queuePatientPairs = queues
      .filter(q => q.patients) // Only include queues with patients
      .map(q => ({
        queue: q as Queue,
        patient: q.patients as Patient
      }));

    logger.info(`Found ${queuePatientPairs.length} waiting queues with patients`);
    return queuePatientPairs;
  } catch (error) {
    logger.error('Error getting next 3 waiting queues:', error);
    return [];
  }
};

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
