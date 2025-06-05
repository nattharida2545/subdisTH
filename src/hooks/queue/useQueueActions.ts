
import { useCallback } from 'react';
import { toast } from 'sonner';
import { Queue, QueueStatus } from '@/integrations/supabase/schema';
import { supabase } from '@/integrations/supabase/client';
import { announceQueue } from '@/utils/textToSpeech';
import { getServicePointById } from '@/utils/servicePointUtils';
import { QueueAlgorithmType, ServicePointCapability } from '@/utils/queueAlgorithms';
import { createLogger } from '@/utils/logger';
import { mapToQueueObject } from '@/utils/queue/queueMapping';
import { useQueueCoreActions } from './actions/useQueueCoreActions';
import { useQueueTransferActions } from './actions/useQueueTransferActions';
import { useServicePointActions } from './actions/useServicePointActions';

const logger = createLogger('useQueueActions');

export const useQueueActions = (
  queues: Queue[],
  updateQueueStatus: (queueId: string, status: QueueStatus) => Promise<Queue | null>,
  updateQueueInState: (queue: Queue) => void,
  fetchQueues: () => Promise<void>,
  sortQueues: (queues: Queue[], servicePointCapabilities: ServicePointCapability[], selectedServicePointId?: string) => Queue[],
  queueAlgorithm: QueueAlgorithmType,
  recallQueue: (queueId: string, getQueueById: (id: string) => Queue | undefined) => void,
  voiceEnabled: boolean
) => {
  // Use the core actions hook
  const {
    callQueue: basecallQueue,
    returnSkippedQueueToWaiting
  } = useQueueCoreActions(queues, updateQueueInState, voiceEnabled);

  // Use the transfer actions hook
  const {
    transferQueueToServicePoint,
    putQueueOnHold
  } = useQueueTransferActions(updateQueueInState);

  // Use the service point actions hook
  const {
    getIntelligentServicePointSuggestion,
    getNextQueueToCall
  } = useServicePointActions(queues, sortQueues);

  // Enhanced call queue that includes intelligent service point suggestion
  const callQueue = useCallback(async (queueId: string, servicePointId?: string): Promise<Queue | null> => {
    try {
      const queue = queues.find(q => q.id === queueId);
      if (!queue) {
        toast.error('ไม่พบคิวที่ต้องการเรียก');
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
      logger.error('Error in enhanced callQueue:', error);
      toast.error('เกิดข้อผิดพลาดในการเรียกคิว');
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
