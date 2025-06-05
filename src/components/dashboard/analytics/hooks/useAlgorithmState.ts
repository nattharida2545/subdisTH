
import * as React from 'react';
import { QueueAlgorithmType } from '@/utils/queueAlgorithms';

export const useAlgorithmState = (urgentCount: number, elderlyCount: number, waitingQueueCount: number) => {
  // Always define state hooks first
  const [currentAlgorithm, setCurrentAlgorithm] = React.useState<QueueAlgorithmType>(
    (localStorage.getItem('queue_algorithm') as QueueAlgorithmType) || QueueAlgorithmType.FIFO
  );
  const [recommendedAlgorithm, setRecommendedAlgorithm] = React.useState<QueueAlgorithmType>(currentAlgorithm);
  const [shouldChangeAlgorithm, setShouldChangeAlgorithm] = React.useState(false);
  
  // Define callbacks with useCallback before useEffect
  const handleChangeAlgorithm = React.useCallback(() => {
    localStorage.setItem('queue_algorithm', recommendedAlgorithm);
    setCurrentAlgorithm(recommendedAlgorithm);
    setShouldChangeAlgorithm(false);
  }, [recommendedAlgorithm]);
  
  // useEffect should always be at the end
  React.useEffect(() => {
    let recommended = QueueAlgorithmType.FIFO;
    let shouldChange = false;
    
    // If there are many urgent cases, prioritize them
    if (urgentCount > 3 || (urgentCount > 0 && urgentCount / waitingQueueCount > 0.2)) {
      recommended = QueueAlgorithmType.PRIORITY;
      shouldChange = currentAlgorithm !== QueueAlgorithmType.PRIORITY;
    } 
    // If there's a mix of elderly and regular, use multilevel
    else if (elderlyCount > 5 || (elderlyCount > 0 && elderlyCount / waitingQueueCount > 0.3)) {
      recommended = QueueAlgorithmType.MULTILEVEL;
      shouldChange = currentAlgorithm !== QueueAlgorithmType.MULTILEVEL;
    } 
    // For a well-distributed mix with a larger queue, suggest feedback queue
    else if (waitingQueueCount > 10) {
      recommended = QueueAlgorithmType.MULTILEVEL_FEEDBACK;
      shouldChange = currentAlgorithm !== QueueAlgorithmType.MULTILEVEL_FEEDBACK;
    }
    
    setRecommendedAlgorithm(recommended);
    setShouldChangeAlgorithm(shouldChange);
  }, [urgentCount, elderlyCount, waitingQueueCount, currentAlgorithm]);
  
  return {
    currentAlgorithm,
    recommendedAlgorithm,
    shouldChangeAlgorithm,
    handleChangeAlgorithm,
  };
};
