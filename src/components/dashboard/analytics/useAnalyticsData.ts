
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
  
  // Time frame state
  const { timeFrame, setTimeFrame } = useTimeFrameState();
  
  // Chart data hooks
  const waitTimeData = useWaitTimeData(timeFrame);
  const throughputData = useThroughputData(timeFrame);
  
  // Calculate metrics
  const { 
    averageWaitTime,
    averageServiceTime,
    urgentCount,
    elderlyCount
  } = useQueueMetrics(completedQueues);
  
  // Algorithm recommendation
  const {
    currentAlgorithm,
    recommendedAlgorithm,
    shouldChangeAlgorithm,
    handleChangeAlgorithm
  } = useAlgorithmState(urgentCount, elderlyCount, waitingQueues.length);
  
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
    urgentCount,
    elderlyCount,
    handleChangeAlgorithm
  };
};
