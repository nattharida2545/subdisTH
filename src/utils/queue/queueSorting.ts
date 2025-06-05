
import { QueueAlgorithmType } from '@/utils/queueAlgorithms';

// Sorting function that can be used directly by components
export const sortQueuesByCustomCriteria = (
  queues: any[],
  criteria: 'priority' | 'waitTime' | 'creationTime' = 'priority'
): any[] => {
  return [...queues].sort((a, b) => {
    switch (criteria) {
      case 'priority':
        // First by priority, then by creation time
        if (a.priority !== b.priority) {
          return b.priority - a.priority; // Higher priority first
        }
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        
      case 'waitTime':
        // By wait time (current time - creation time)
        const aWaitTime = new Date().getTime() - new Date(a.created_at).getTime();
        const bWaitTime = new Date().getTime() - new Date(b.created_at).getTime();
        return bWaitTime - aWaitTime; // Longest wait first
        
      case 'creationTime':
      default:
        // By creation time (oldest first)
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
  });
};
