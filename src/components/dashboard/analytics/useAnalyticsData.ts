
// Update this file to use proper logging

import { Queue } from '@/integrations/supabase/schema';
import { useTimeFrameState } from './hooks/useTimeFrameState';
import { useWaitTimeData } from './hooks/useWaitTimeData';
import { useThroughputData } from './hooks/useThroughputData';
import { useQueueMetrics } from './hooks/useQueueMetrics';
import { useAlgorithmState } from './hooks/useAlgorithmState';
import { createLogger } from '@/utils/logger';
import * as React from 'react';

const logger = createLogger('AnalyticsData');

export const useAnalyticsData = (completedQueues: Queue[], waitingQueues: Queue[]) => {
  // Always define useState hooks first
  const [initialized, setInitialized] = React.useState(false);
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);
  
  // Time frame state
  const { timeFrame, setTimeFrame } = useTimeFrameState();
  
  // Chart data hooks with refresh trigger
  const waitTimeData = useWaitTimeData(timeFrame, refreshTrigger);
  const throughputData = useThroughputData(timeFrame, refreshTrigger);
  
  // Calculate metrics from completed queues
  const { 
    averageWaitTime,
    averageServiceTime,
    urgentCount: completedUrgentCount,
    elderlyCount: completedElderlyCount
  } = useQueueMetrics(completedQueues);
  
  // Calculate waiting queue metrics for algorithm recommendations
  const waitingUrgentCount = waitingQueues.filter(q => q.type === 'URGENT').length;
  const waitingElderlyCount = waitingQueues.filter(q => q.type === 'ELDERLY').length;
  
  // Algorithm recommendation using WAITING queues (not completed)
  const {
    currentAlgorithm,
    recommendedAlgorithm,
    shouldChangeAlgorithm,
    handleChangeAlgorithm
  } = useAlgorithmState(waitingUrgentCount, waitingElderlyCount, waitingQueues.length);
  
  // Force refresh charts when queues change significantly
  React.useEffect(() => {
    const totalQueues = completedQueues.length + waitingQueues.length;
    if (totalQueues > 0) {
      setRefreshTrigger(prev => prev + 1);
    }
  }, [completedQueues.length, waitingQueues.length]);
  
  // useEffect should be the last hook
  React.useEffect(() => {
    logger.debug('Analytics data prepared', {
      timeFrame,
      averageWaitTime,
      averageServiceTime,
      currentAlgorithm
    });
    
    setInitialized(true);
  }, [timeFrame, averageWaitTime, averageServiceTime, currentAlgorithm]);
  
  logger.debug('Hook initialized with completed queue count:', completedQueues?.length);
  
  return {
    timeFrame,
    setTimeFrame,
    waitTimeData,
    throughputData,
    averageWaitTime,
    averageServiceTime,
    currentAlgorithm,
    recommendedAlgorithm,
    shouldChangeAlgorithm,
    urgentCount: waitingUrgentCount,
    elderlyCount: waitingElderlyCount,
    handleChangeAlgorithm,
    refreshTrigger
  };
};
