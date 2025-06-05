
import * as React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { createLogger } from '@/utils/logger';
import { queueSupabaseRequest } from '@/utils/requestThrottler';
import { PharmacyQueue } from './types';
import { QueueStatus, QueueTypeEnum } from '@/integrations/supabase/schema';
import { toast } from 'sonner';

const logger = createLogger('usePharmacyQueueActions');

interface UsePharmacyQueueActionsProps {
  activeQueue: PharmacyQueue | null;
  setActiveQueue: (queue: PharmacyQueue | null) => void;
  fetchPharmacyQueues: () => Promise<PharmacyQueue[]>;
}

export const usePharmacyQueueActions = ({
  activeQueue,
  setActiveQueue,
  fetchPharmacyQueues
}: UsePharmacyQueueActionsProps) => {
  const [loadingNext, setLoadingNext] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Call next queue - Define this callback before any useEffects
  const callNextQueue = React.useCallback(async (servicePointId?: string) => {
    try {
      if (activeQueue) {
        toast.warning('กรุณาดำเนินการกับคิวปัจจุบันให้เสร็จก่อน');
        return null;
      }

      // Service point is now required
      if (!servicePointId) {
        toast.warning('กรุณาเลือกจุดบริการก่อนเรียกคิว');
        return null;
      }

      setLoadingNext(true);
      setError(null);
      logger.info(`Fetching next waiting queue for service point: ${servicePointId}`);

      // Get today's date in yyyy-mm-dd
      const todayDate = new Date().toISOString().slice(0, 10);

      // First get the service point's allowed queue types
      const spQueueTypesResult = await queueSupabaseRequest(async () => {
        return await supabase
          .from('service_point_queue_types')
          .select('queue_type_id')
          .eq('service_point_id', servicePointId);
      });

      if (spQueueTypesResult.error) {
        throw spQueueTypesResult.error;
      }

      // If no queue types are configured for this service point
      if (!spQueueTypesResult.data || spQueueTypesResult.data.length === 0) {
        toast.warning('จุดบริการนี้ไม่ได้กำหนดประเภทคิวที่สามารถให้บริการได้');
        return null;
      }

      // Extract just the queue type IDs
      const queueTypeIds = spQueueTypesResult.data.map(item => item.queue_type_id);
      
      // Get queue types
      const queueTypesResult = await queueSupabaseRequest(async () => {
        return await supabase
          .from('queue_types')
          .select('id, code')
          .in('id', queueTypeIds);
      });

      if (queueTypesResult.error) {
        throw queueTypesResult.error;
      }

      // Map queue type IDs to codes
      const queueTypeCodes = queueTypesResult.data.map(item => item.code);
      
      if (queueTypeCodes.length === 0) {
        toast.warning('ไม่พบข้อมูลประเภทคิวสำหรับจุดบริการนี้');
        return null;
      }

      // Get the next waiting queue that matches the allowed queue types
      const waitingResult = await queueSupabaseRequest(async () => {
        return await supabase
          .from('queues')
          .select(`
            *,
            patient:patients(*)
          `)
          .eq('queue_date', todayDate)
          .eq('status', 'WAITING')
          .in('type', queueTypeCodes)
          .order('created_at', { ascending: true })
          .limit(1);
      });

      if (waitingResult.error) {
        throw waitingResult.error;
      }

      if (!waitingResult.data || waitingResult.data.length === 0) {
        toast.info('ไม่มีคิวที่รอดำเนินการสำหรับจุดบริการนี้');
        return null;
      }

      const nextQueue = waitingResult.data[0];
      
      // Update the queue status to ACTIVE and set the service point
      const updateResult = await queueSupabaseRequest(async () => {
        return await supabase
          .from('queues')
          .update({ 
            status: 'ACTIVE', 
            called_at: new Date().toISOString(),
            service_point_id: servicePointId
          })
          .eq('id', nextQueue.id)
          .select(`
            *,
            patient:patients(*)
          `);
      });

      if (updateResult.error) {
        throw updateResult.error;
      }

      if (!updateResult.data || updateResult.data.length === 0) {
        throw new Error('Failed to update queue status');
      }

      const activatedQueue = updateResult.data[0];
      
      // Create a pharmacy service record
      const serviceResult = await queueSupabaseRequest(async () => {
        return await supabase
          .from('pharmacy_queue_services')
          .insert({
            queue_id: activatedQueue.id,
            status: 'IN_PROGRESS',
            service_start_at: new Date().toISOString()
          })
          .select();
      });

      if (serviceResult.error) {
        throw serviceResult.error;
      }

      const serviceData = serviceResult.data && serviceResult.data.length > 0 
        ? serviceResult.data[0] 
        : undefined;

      // Ensure the service status is correctly typed
      const service = serviceData ? {
        ...serviceData,
        status: serviceData.status as 'IN_PROGRESS' | 'COMPLETED' | 'FORWARDED',
        pharmacist_notes: serviceData.pharmacist_notes || null,
        forwarded_to: serviceData.forwarded_to || null,
        service_end_at: serviceData.service_end_at || null
      } : undefined;

      const newActiveQueue: PharmacyQueue = {
        ...activatedQueue,
        type: activatedQueue.type as QueueTypeEnum,
        status: activatedQueue.status as QueueStatus,
        service
      };

      setActiveQueue(newActiveQueue);
      await fetchPharmacyQueues(); // Refresh all queues
      
      toast.success(`เรียกคิวหมายเลข ${newActiveQueue.number} เข้ารับบริการ`);
      return newActiveQueue;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to call next queue';
      logger.error('Error calling next queue:', err);
      setError(errorMessage);
      toast.error('ไม่สามารถเรียกคิวถัดไปได้');
      return null;
    } finally {
      setLoadingNext(false);
    }
  }, [activeQueue, setActiveQueue, fetchPharmacyQueues]);

  return {
    loadingNext,
    error,
    callNextQueue
  };
};
