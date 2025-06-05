
import { QueueAlgorithmType } from '@/utils/queueAlgorithms';
import { Queue } from '@/integrations/supabase/schema';
import { applyFifoAlgorithm } from './fifoAlgorithm';
import { applyPriorityAlgorithm } from './priorityAlgorithm';
import { applyMultilevelAlgorithm } from './multilevelAlgorithm';
import { applyMultilevelFeedbackAlgorithm } from './multilevelFeedbackAlgorithm';
import { applyRoundRobinAlgorithm } from './roundRobinAlgorithm';

// Select and apply the appropriate algorithm based on the algorithm type
export async function applyQueueAlgorithm(
  waitingQueues: any[],
  queueTypeMap: Record<string, any>,
  algorithm: QueueAlgorithmType
): Promise<Queue | null> {
  switch (algorithm) {
    case QueueAlgorithmType.FIFO:
      return applyFifoAlgorithm(waitingQueues);
    case QueueAlgorithmType.PRIORITY:
      return applyPriorityAlgorithm(waitingQueues, queueTypeMap);
    case QueueAlgorithmType.MULTILEVEL:
      return applyMultilevelAlgorithm(waitingQueues, queueTypeMap);
    case QueueAlgorithmType.MULTILEVEL_FEEDBACK:
      return applyMultilevelFeedbackAlgorithm(waitingQueues, queueTypeMap);
    case QueueAlgorithmType.ROUND_ROBIN:
      return applyRoundRobinAlgorithm(waitingQueues, queueTypeMap);
    default:
      return applyFifoAlgorithm(waitingQueues);
  }
}
