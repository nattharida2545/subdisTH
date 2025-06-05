
import { createLogger } from '@/utils/logger';
import { useQueueCore } from './queue/core/useQueueCore';
import { useQueueActionHandlers } from './queue/core/useQueueActionHandlers';

const logger = createLogger('useQueues');

export const useQueues = () => {
  logger.debug('Hook initialized');
  
  // Use the core queue functionality
  const {
    queues,
    loading,
    error,
    fetchQueues,
    addQueue,
    updateQueueStatus,
    removeQueue,
    getQueuesByStatus,
    updateQueueInState
  } = useQueueCore();

  // Use the action handlers
  const {
    voiceEnabled,
    setVoiceEnabled,
    counterName,
    setCounterName,
    updateQueueSettings,
    recallQueue,
    queueAlgorithm,
    setQueueAlgorithm,
    sortQueues,
    callQueue,
    getNextQueueToCall,
    transferQueueToServicePoint,
    putQueueOnHold,
    returnSkippedQueueToWaiting
  } = useQueueActionHandlers(queues, updateQueueStatus, updateQueueInState, fetchQueues);

  return {
    queues,
    loading,
    error,
    fetchQueues,
    addQueue,
    updateQueueStatus,
    removeQueue,
    getQueuesByStatus,
    callQueue,
    recallQueue,
    voiceEnabled,
    setVoiceEnabled,
    counterName,
    setCounterName,
    updateQueueSettings,
    sortQueues,
    queueAlgorithm,
    setQueueAlgorithm,
    getNextQueueToCall,
    transferQueueToServicePoint,
    putQueueOnHold,
    returnSkippedQueueToWaiting
  };
};
