
import { useCallback } from 'react';
import { Queue } from '@/integrations/supabase/schema';
import { useQueueActions } from '../useQueueActions';
import { useQueueAnnouncements } from '../useQueueAnnouncements';
import { useQueueAlgorithm } from '../useQueueAlgorithm';

export const useQueueActionHandlers = (
  queues: Queue[],
  updateQueueStatus: any,
  updateQueueInState: any,
  fetchQueues: any
) => {
  const { 
    voiceEnabled, 
    setVoiceEnabled, 
    counterName, 
    setCounterName, 
    updateQueueSettings, 
    recallQueue: baseRecallQueue 
  } = useQueueAnnouncements();
  
  const {
    queueAlgorithm,
    setQueueAlgorithm,
    queueTypes,
    sortQueues
  } = useQueueAlgorithm();

  // Wrapper for recallQueue that gets queue by ID first
  const recallQueue = useCallback((queueId: string) => {
    const getQueueById = (id: string) => queues.find(q => q.id === id);
    return baseRecallQueue(queueId, getQueueById);
  }, [queues, baseRecallQueue]);
  
  // Use our queue actions hook
  const {
    callQueue,
    getNextQueueToCall,
    transferQueueToServicePoint,
    putQueueOnHold,
    returnSkippedQueueToWaiting
  } = useQueueActions(
    queues,
    updateQueueStatus,
    updateQueueInState,
    fetchQueues, 
    sortQueues,
    queueAlgorithm,
    baseRecallQueue,
    voiceEnabled
  );

  return {
    // Voice and announcement controls
    voiceEnabled,
    setVoiceEnabled,
    counterName,
    setCounterName,
    updateQueueSettings,
    recallQueue,
    
    // Queue algorithm controls
    queueAlgorithm,
    setQueueAlgorithm,
    sortQueues,
    
    // Queue actions
    callQueue,
    getNextQueueToCall,
    transferQueueToServicePoint,
    putQueueOnHold,
    returnSkippedQueueToWaiting
  };
};
