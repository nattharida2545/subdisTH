
import { useCallback } from 'react';
import { toast } from 'sonner';
import { Queue, QueueStatus } from '@/integrations/supabase/schema';
import { supabase } from '@/integrations/supabase/client';
import { announceQueue } from '@/utils/textToSpeech';
import { getServicePointById } from '@/utils/servicePointUtils';
import { createLogger } from '@/utils/logger';
import { mapToQueueObject } from '@/utils/queue/queueMapping';
import { useSmsNotifications } from '@/hooks/useSmsNotifications';

const logger = createLogger('useQueueCoreActions');

export const useQueueCoreActions = (
  queues: Queue[],
  updateQueueInState: (queue: Queue) => void,
  voiceEnabled: boolean
) => {
  const { sendSmsToNextQueues } = useSmsNotifications();

  // Call next queue for a specific service point
  const callQueue = useCallback(async (queueId: string, servicePointId?: string): Promise<Queue | null> => {
    try {
      const queue = queues.find(q => q.id === queueId);
      if (!queue) {
        toast.error('ไม่พบคิวที่ต้องการเรียก');
        return null;
      }

      let targetServicePointId = servicePointId;

      // If no service point specified, use queue's existing service point
      if (!targetServicePointId && queue.service_point_id) {
        targetServicePointId = queue.service_point_id;
      }

      const updateData: any = {
        status: 'ACTIVE',
        called_at: new Date().toISOString()
      };

      // Add service point assignment if we have one
      if (targetServicePointId) {
        updateData.service_point_id = targetServicePointId;
      }

      const { data, error } = await supabase
        .from('queues')
        .update(updateData)
        .eq('id', queueId)
        .select()
        .single();

      if (error) {
        logger.error('Error calling queue:', error);
        toast.error('ไม่สามารถเรียกคิวได้');
        return null;
      }

      if (data) {
        // Convert raw data to properly typed Queue object
        const typedQueue = mapToQueueObject(data);
        updateQueueInState(typedQueue);
        
        // Announce queue if voice is enabled
        if (voiceEnabled) {
          // Get service point information for announcement
          const servicePointInfo = targetServicePointId 
            ? await getServicePointById(targetServicePointId)
            : null;
          
          await announceQueue(
            queue.number, 
            servicePointInfo || { code: '', name: 'ช่องบริการ หนึ่ง' }, 
            queue.type
          );
        }
        
        // Send SMS notifications to next 3 queues for all service points
        try {
          await sendSmsToNextQueues();
        } catch (smsError) {
          logger.error('SMS notification error (non-blocking):', smsError);
          // Don't fail the main queue call if SMS fails
        }
        
        toast.success(`เรียกคิวหมายเลข ${queue.number} เรียบร้อยแล้ว`);
        return typedQueue;
      }

      return null;
    } catch (error) {
      logger.error('Error in callQueue:', error);
      toast.error('เกิดข้อผิดพลาดในการเรียกคิว');
      return null;
    }
  }, [queues, updateQueueInState, voiceEnabled, sendSmsToNextQueues]);

  // Return skipped queue to waiting
  const returnSkippedQueueToWaiting = useCallback(async (queueId: string): Promise<Queue | null> => {
    try {
      const { data, error } = await supabase
        .from('queues')
        .update({
          status: 'WAITING',
          skipped_at: null
        })
        .eq('id', queueId)
        .select()
        .single();

      if (error) {
        logger.error('Error returning skipped queue to waiting:', error);
        toast.error('ไม่สามารถนำคิวกลับมารอได้');
        return null;
      }

      if (data) {
        // Convert raw data to properly typed Queue object
        const typedQueue = mapToQueueObject(data);
        updateQueueInState(typedQueue);
        toast.success('นำคิวกลับมารอเรียบร้อยแล้ว');
        return typedQueue;
      }

      return null;
    } catch (error) {
      logger.error('Error in returnSkippedQueueToWaiting:', error);
      toast.error('เกิดข้อผิดพลาดในการนำคิวกลับมารอ');
      return null;
    }
  }, [updateQueueInState]);

  return {
    callQueue,
    returnSkippedQueueToWaiting
  };
};
