import { createLogger } from "@/utils/logger";
import { useInsQueueCore } from "./queue/core/useInsQueueCore";
import { useInsQueueActionHandlers } from "./queue/core/useInsQueueActionHandlers";

const logger = createLogger("useInsQueues");

export const useInsQueues = () => {
  logger.debug("INS Queues Hook initialized");

  // Use the core INS queue functionality
  const {
    queues,
    allQueues,
    loading,
    error,
    fetchQueues,
    addQueue,
    updateQueueStatus,
    removeQueue,
    getQueuesByStatus,
    updateQueueInState,
    allQueuesNofilter,
  } = useInsQueueCore();

  // Use the INS action handlers
  const {
    voiceEnabled,
    setVoiceEnabled,
    counterName,
    setCounterName,
    updateQueueSettings,
    recallQueue,
    callQueue,
    getNextQueueToCall,
    transferQueueToServicePoint,
    putQueueOnHold,
    returnSkippedQueueToWaiting,
  } = useInsQueueActionHandlers(
    queues,
    updateQueueStatus,
    updateQueueInState,
    fetchQueues
  );

  return {
    queues,
    allQueues,
    allQueuesNofilter,
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
    getNextQueueToCall,
    transferQueueToServicePoint,
    putQueueOnHold,
    returnSkippedQueueToWaiting,
  };
};
