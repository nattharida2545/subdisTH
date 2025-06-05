
import { supabase } from '@/integrations/supabase/client';
import { ServicePoint, Queue, QueueTypeEnum, QueueStatus } from '@/integrations/supabase/schema';
import { ensureQueueTypeEnum, ensureQueueStatus } from './queueTypes';

// Get service points that can handle a specific queue type
export const getServicePointsForQueueType = async (queueTypeCode: string): Promise<ServicePoint[]> => {
  try {
    // Get service point IDs that can handle this queue type
    const { data: servicePointQueueTypes, error: spqtError } = await supabase
      .from('service_point_queue_types')
      .select(`
        service_point_id,
        queue_type:queue_types!inner(code)
      `)
      .eq('queue_types.code', queueTypeCode);

    if (spqtError) {
      throw spqtError;
    }

    if (!servicePointQueueTypes || servicePointQueueTypes.length === 0) {
      return [];
    }

    // Extract service point IDs
    const servicePointIds = servicePointQueueTypes.map(spqt => spqt.service_point_id);

    // Get service point details
    const { data: servicePoints, error: spError } = await supabase
      .from('service_points')
      .select('*')
      .in('id', servicePointIds)
      .eq('enabled', true);

    if (spError) {
      throw spError;
    }

    return servicePoints || [];
  } catch (error) {
    console.error('Error getting service points for queue type:', error);
    return [];
  }
};

// Assign a queue to a service point
export const assignQueueToServicePoint = async (
  queueId: string, 
  servicePointId: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('queues')
      .update({ service_point_id: servicePointId })
      .eq('id', queueId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error assigning queue to service point:', error);
    return false;
  }
};

// Get queues for a specific service point
export const getQueuesByServicePoint = async (
  servicePointId: string, 
  status: string = 'WAITING',
  queueDate: string = new Date().toISOString().split('T')[0]
): Promise<Queue[]> => {
  try {
    const { data, error } = await supabase
      .from('queues')
      .select(`
        *,
        patient:patients(id, name, phone)
      `)
      .eq('service_point_id', servicePointId)
      .eq('status', status)
      .eq('queue_date', queueDate)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    // Transform data to ensure type safety
    return data ? data.map(queue => ({
      ...queue,
      type: ensureQueueTypeEnum(queue.type),
      status: ensureQueueStatus(queue.status)
    })) : [];
  } catch (error) {
    console.error('Error getting queues by service point:', error);
    return [];
  }
};

// Get next queue for a service point
export const getNextQueueForServicePoint = async (
  servicePointId: string,
  queueDate: string = new Date().toISOString().split('T')[0]
): Promise<Queue | null> => {
  try {
    const { data, error } = await supabase
      .from('queues')
      .select(`
        *,
        patient:patients(id, name, phone)
      `)
      .eq('service_point_id', servicePointId)
      .eq('status', 'WAITING')
      .eq('queue_date', queueDate)
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned - this is not really an error in this context
        return null;
      }
      throw error;
    }

    // Transform data to ensure type safety
    return data ? {
      ...data,
      type: ensureQueueTypeEnum(data.type),
      status: ensureQueueStatus(data.status)
    } : null;
  } catch (error) {
    console.error('Error getting next queue for service point:', error);
    return null;
  }
};
