import { useCallback } from 'react';
import { toast } from 'sonner';
import { QueueIns, QueueStatus } from '@/integrations/supabase/schema';
import { supabase } from '@/integrations/supabase/client';
import { announceQueue } from '@/utils/textToSpeech';
import { getServicePointInsById } from '@/utils/servicePointInsUtils';
import { createLogger } from '@/utils/logger';
import { useSmsNotifications } from '@/hooks/useSmsNotifications';

const logger = createLogger('useInsQueueCoreActions');

export const useInsQueueCoreActions = (
  queues: QueueIns[],
  updateQueueInState: (queue: QueueIns) => void,
  voiceEnabled: boolean
) => {
  const { sendSmsToNextQueueIns } = useSmsNotifications();

  // Call next INS queue for a specific service point
  const callQueue = useCallback(async (queueId: string, servicePointId?: string): Promise<QueueIns | null> => {
    try {
      const queue = queues.find(q => q.id === queueId);
      if (!queue) {
        toast.error('ไม่พบคิว INS ที่ต้องการเรียก');
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
        .from('queues_ins')
        .update(updateData)
        .eq('id', queueId)
        .select()
        .single();

      if (error) {
        logger.error('Error calling INS queue:', error);
        toast.error('ไม่สามารถเรียกคิว INS ได้');
        return null;
      }

      if (data) {
        updateQueueInState(data);
        
        // Announce queue if voice is enabled
        if (voiceEnabled) {
          // Get service point information for announcement
          const servicePointInfo = targetServicePointId 
            ? await getServicePointInsById(targetServicePointId)
            : null;
          
          await announceQueue(
            queue.number, 
            servicePointInfo || { code: '', name: 'ช่องบริการ หนึ่ง' }, 
            queue.type
          );
        }
        
        // Send SMS notifications to next 3 INS queues
        try {
          await sendSmsToNextQueueIns();
        } catch (smsError) {
          logger.error('SMS notification error (non-blocking):', smsError);
          // Don't fail the main queue call if SMS fails
        }
        
        toast.success(`เรียกคิว INS หมายเลข ${queue.number} เรียบร้อยแล้ว`);
        return data;
      }

      return null;
    } catch (error) {
      logger.error('Error in callQueue INS:', error);
      toast.error('เกิดข้อผิดพลาดในการเรียกคิว INS');
      return null;
    }
  }, [queues, updateQueueInState, voiceEnabled, sendSmsToNextQueueIns]);

  // Return skipped INS queue to waiting
  const returnSkippedQueueToWaiting = useCallback(async (queueId: string): Promise<QueueIns | null> => {
    try {
      const { data, error } = await supabase
        .from('queues_ins')
        .update({
          status: 'WAITING',
          skipped_at: null
        })
        .eq('id', queueId)
        .select()
        .single();

      if (error) {
        logger.error('Error returning skipped INS queue to waiting:', error);
        toast.error('ไม่สามารถนำคิว INS กลับมารอได้');
        return null;
      }

      if (data) {
        updateQueueInState(data);
        toast.success('นำคิว INS กลับมารอเรียบร้อยแล้ว');
        return data;
      }

      return null;
    } catch (error) {
      logger.error('Error in returnSkippedQueueToWaiting INS:', error);
      toast.error('เกิดข้อผิดพลาดในการนำคิว INS กลับมารอ');
      return null;
    }
  }, [updateQueueInState]);

  return {
    callQueue,
    returnSkippedQueueToWaiting
  };
};
