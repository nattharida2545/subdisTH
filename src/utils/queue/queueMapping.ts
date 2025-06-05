
import { Queue, QueueStatus, QueueTypeEnum } from '@/integrations/supabase/schema';
import { ensureQueueStatus, ensureQueueTypeEnum } from './queueTypes';

// Function to convert a Supabase queue result to a strongly-typed Queue object
export const mapToQueueObject = (queueData: any): Queue => {
  return {
    id: queueData.id,
    number: queueData.number,
    patient_id: queueData.patient_id,
    type: ensureQueueTypeEnum(queueData.type),
    status: ensureQueueStatus(queueData.status),
    service_point_id: queueData.service_point_id,
    notes: queueData.notes || null,
    created_at: queueData.created_at,
    updated_at: queueData.updated_at,
    called_at: queueData.called_at || null,
    completed_at: queueData.completed_at || null,
    queue_date: queueData.queue_date || null
  };
};
