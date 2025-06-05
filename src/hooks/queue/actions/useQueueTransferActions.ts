
import { useCallback } from 'react';
import { toast } from 'sonner';
import { Queue } from '@/integrations/supabase/schema';
import { supabase } from '@/integrations/supabase/client';
import { createLogger } from '@/utils/logger';
import { mapToQueueObject } from '@/utils/queue/queueMapping';

const logger = createLogger('useQueueTransferActions');

export const useQueueTransferActions = (
  updateQueueInState: (queue: Queue) => void
) => {
  // Transfer queue to another service point
  const transferQueueToServicePoint = useCallback(async (
    queueId: string,
    sourceServicePointId: string,
    targetServicePointId: string,
    notes?: string,
    newQueueType?: string
  ): Promise<Queue | null> => {
    try {
      const updateData: any = {
        service_point_id: targetServicePointId,
        transferred_to_service_point_id: sourceServicePointId,
        transferred_at: new Date().toISOString()
      };

      if (notes) {
        updateData.notes = notes;
      }

      if (newQueueType) {
        updateData.type = newQueueType;
      }

      const { data, error } = await supabase
        .from('queues')
        .update(updateData)
        .eq('id', queueId)
        .select()
        .single();

      if (error) {
        logger.error('Error transferring queue:', error);
        toast.error('ไม่สามารถโอนคิวได้');
        return null;
      }

      if (data) {
        // Convert raw data to properly typed Queue object
        const typedQueue = mapToQueueObject(data);
        updateQueueInState(typedQueue);
        toast.success('โอนคิวเรียบร้อยแล้ว');
        return typedQueue;
      }

      return null;
    } catch (error) {
      logger.error('Error in transferQueueToServicePoint:', error);
      toast.error('เกิดข้อผิดพลาดในการโอนคิว');
      return null;
    }
  }, [updateQueueInState]);

  // Put queue on hold
  const putQueueOnHold = useCallback(async (queueId: string, servicePointId: string, reason?: string): Promise<Queue | null> => {
    try {
      const updateData: any = {
        status: 'WAITING',
        paused_at: new Date().toISOString()
      };

      if (reason) {
        updateData.notes = reason;
      }

      const { data, error } = await supabase
        .from('queues')
        .update(updateData)
        .eq('id', queueId)
        .select()
        .single();

      if (error) {
        logger.error('Error putting queue on hold:', error);
        toast.error('ไม่สามารถพักคิวได้');
        return null;
      }

      if (data) {
        // Convert raw data to properly typed Queue object
        const typedQueue = mapToQueueObject(data);
        updateQueueInState(typedQueue);
        toast.success('พักคิวเรียบร้อยแล้ว');
        return typedQueue;
      }

      return null;
    } catch (error) {
      logger.error('Error in putQueueOnHold:', error);
      toast.error('เกิดข้อผิดพลาดในการพักคิว');
      return null;
    }
  }, [updateQueueInState]);

  return {
    transferQueueToServicePoint,
    putQueueOnHold
  };
};
