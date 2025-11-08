import { useCallback } from 'react';
import { toast } from 'sonner';
import { QueueIns, QueueStatus } from '@/integrations/supabase/schema';
import { supabase } from '@/integrations/supabase/client';
import { announceQueue } from '@/utils/textToSpeech';
import { getServicePointInsById } from '@/utils/servicePointInsUtils';
import { createLogger } from '@/utils/logger';
import { useInsQueueCoreActions } from './actions/useInsQueueCoreActions';
import { useInsQueueTransferActions } from './actions/useInsQueueTransferActions';
import { useInsServicePointActions } from './actions/useInsServicePointActions';

const logger = createLogger('useInsQueueActions');

export const useInsQueueActions = (
  queues: QueueIns[],
  updateQueueStatus: (queueId: string, status: QueueStatus) => Promise<QueueIns | null>,
  updateQueueInState: (queue: QueueIns) => void,
  fetchQueues: () => Promise<void>,
  recallQueue: (queueId: string, getQueueById: (id: string) => QueueIns | undefined) => void,
  voiceEnabled: boolean
) => {
  // Use the core actions hook
  const {
    callQueue: basecallQueue,
    returnSkippedQueueToWaiting
  } = useInsQueueCoreActions(queues, updateQueueInState, voiceEnabled);

  // Use the transfer actions hook
  const {
    transferQueueToServicePoint,
    putQueueOnHold
  } = useInsQueueTransferActions(updateQueueInState);

  // Use the service point actions hook
  const {
    getIntelligentServicePointSuggestion,
    getNextQueueToCall
  } = useInsServicePointActions(queues);

  // Enhanced call queue that includes intelligent service point suggestion
  const callQueue = useCallback(async (queueId: string, servicePointId?: string): Promise<QueueIns | null> => {
    try {
      const queue = queues.find(q => q.id === queueId);
      if (!queue) {
        toast.error('ไม่พบคิว INS ที่ต้องการเรียก');
        return null;
      }

      let targetServicePointId = servicePointId;

      // If no service point specified, try to get intelligent suggestion
      if (!targetServicePointId && !queue.service_point_id) {
        const suggestedServicePoint = await getIntelligentServicePointSuggestion(queue.type);
        if (suggestedServicePoint) {
          targetServicePointId = suggestedServicePoint.id;
        }
      } else if (queue.service_point_id) {
        targetServicePointId = queue.service_point_id;
      }

      return await basecallQueue(queueId, targetServicePointId);
    } catch (error) {
      logger.error('Error in enhanced callQueue INS:', error);
      toast.error('เกิดข้อผิดพลาดในการเรียกคิว INS');
      return null;
    }
  }, [queues, basecallQueue, getIntelligentServicePointSuggestion]);

  return {
    callQueue,
    getNextQueueToCall,
    transferQueueToServicePoint,
    putQueueOnHold,
    returnSkippedQueueToWaiting,
    getIntelligentServicePointSuggestion
  };
};
