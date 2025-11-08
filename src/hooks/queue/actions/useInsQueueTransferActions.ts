import { useCallback } from 'react';
import { toast } from 'sonner';
import { QueueIns } from '@/integrations/supabase/schema';
import { supabase } from '@/integrations/supabase/client';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useInsQueueTransferActions');

export const useInsQueueTransferActions = (
  updateQueueInState: (queue: QueueIns) => void
) => {
  // Transfer INS queue to another service point
  const transferQueueToServicePoint = useCallback(async (
    queueId: string,
    sourceServicePointId: string,
    targetServicePointId: string,
    notes?: string,
    newQueueType?: string
  ): Promise<QueueIns | null> => {
    try {
      const updateData: any = {
        service_point_id: targetServicePointId,
        transferred_at: new Date().toISOString()
      };

      if (newQueueType) {
        updateData.type = newQueueType;
      }

      const { data, error } = await supabase
        .from('queues_ins')
        .update(updateData)
        .eq('id', queueId)
        .select()
        .single();

      if (error) {
        logger.error('Error transferring INS queue:', error);
        toast.error('ไม่สามารถโอนคิว INS ได้');
        return null;
      }

      if (data) {
        updateQueueInState(data);
        toast.success('โอนคิว INS เรียบร้อยแล้ว');
        return data;
      }

      return null;
    } catch (error) {
      logger.error('Error in transferQueueToServicePoint INS:', error);
      toast.error('เกิดข้อผิดพลาดในการโอนคิว INS');
      return null;
    }
  }, [updateQueueInState]);

  // Put INS queue on hold
  const putQueueOnHold = useCallback(async (queueId: string, servicePointId: string, reason?: string): Promise<QueueIns | null> => {
    try {
      const updateData: any = {
        status: 'WAITING',
        paused_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('queues_ins')
        .update(updateData)
        .eq('id', queueId)
        .select()
        .single();

      if (error) {
        logger.error('Error putting INS queue on hold:', error);
        toast.error('ไม่สามารถพักคิว INS ได้');
        return null;
      }

      if (data) {
        updateQueueInState(data);
        toast.success('พักคิว INS เรียบร้อยแล้ว');
        return data;
      }

      return null;
    } catch (error) {
      logger.error('Error in putQueueOnHold INS:', error);
      toast.error('เกิดข้อผิดพลาดในการพักคิว INS');
      return null;
    }
  }, [updateQueueInState]);

  return {
    transferQueueToServicePoint,
    putQueueOnHold
  };
};
