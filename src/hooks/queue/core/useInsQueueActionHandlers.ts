import { useCallback } from 'react';
import { QueueIns } from '@/integrations/supabase/schema';
import { useInsQueueActions } from '../useInsQueueActions';
import { useQueueAnnouncements } from '../useQueueAnnouncements';

export const useInsQueueActionHandlers = (
  queues: QueueIns[],
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

  // Wrapper for recallQueue that gets queue by ID first
  const recallQueue = useCallback((queueId: string) => {
    const getQueueById = (id: string) => queues.find(q => q.id === id);
    return baseRecallQueue(queueId, getQueueById);
  }, [queues, baseRecallQueue]);
  
  // Use our INS queue actions hook
  const {
    callQueue,
    getNextQueueToCall,
    transferQueueToServicePoint,
    putQueueOnHold,
    returnSkippedQueueToWaiting
  } = useInsQueueActions(
    queues,
    updateQueueStatus,
    updateQueueInState,
    fetchQueues, 
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
    
    
    // Queue actions
    callQueue,
    getNextQueueToCall,
    transferQueueToServicePoint,
    putQueueOnHold,
    returnSkippedQueueToWaiting
  };
};
