
import * as React from 'react';
import { useQueues } from '@/hooks/useQueues';
import { createLogger } from '@/utils/logger';
import { Queue } from '@/integrations/supabase/schema';

const logger = createLogger('useDashboardQueues');

export const useDashboardQueues = () => {
  logger.debug('Hook initialized');
  
  // Get queues data from the useQueues hook
  const { queues = [], sortQueues } = useQueues() || {};
  
  // Initialize state for different queue statuses
  const [queuesByStatus, setQueuesByStatus] = React.useState<{
    waiting: Queue[];
    active: Queue[];
    completed: Queue[];
    skipped: Queue[];
  }>({
    waiting: [],
    active: [],
    completed: [],
    skipped: []
  });
  
  // Memoize the queues array to prevent unnecessary re-renders
  const queuesMemoized = React.useMemo(() => queues, [
    // Only re-create when the queues length changes or when specific key properties change
    queues?.length,
    // Use a stable stringification of key queue properties
    JSON.stringify(queues?.map(q => ({ id: q.id, status: q.status })))
  ]);
  
  // Memoize the sort function
  const sortQueuesMemoized = React.useMemo(() => sortQueues, [
    // Create a stable reference by using a JSON string representation
    JSON.stringify(sortQueues?.toString())
  ]);
  
  // Process queues when data changes
  React.useEffect(() => {
    if (!Array.isArray(queuesMemoized)) return;
    
    // Filter queues by status
    const waiting = queuesMemoized.filter(q => q.status === 'WAITING');
    const active = queuesMemoized.filter(q => q.status === 'ACTIVE');
    const completed = queuesMemoized.filter(q => q.status === 'COMPLETED');
    const skipped = queuesMemoized.filter(q => q.status === 'SKIPPED');
    
    // Only apply sorting to waiting queues for efficiency
    const sortedWaiting = sortQueuesMemoized ? sortQueuesMemoized(waiting) : waiting;
    
    // Compare with previous state to prevent unnecessary updates
    setQueuesByStatus(prev => {
      // Only update if there are actual changes
      const hasChanged = 
        prev.waiting.length !== sortedWaiting.length ||
        prev.active.length !== active.length ||
        prev.completed.length !== completed.length ||
        prev.skipped.length !== skipped.length;
      
      if (!hasChanged) return prev;
      
      return {
        waiting: sortedWaiting as Queue[],  // Explicit type cast to ensure compatibility
        active,
        completed,
        skipped
      };
    });
  }, [queuesMemoized, sortQueuesMemoized]);

  return {
    waitingQueues: queuesByStatus.waiting,
    activeQueues: queuesByStatus.active,
    completedQueues: queuesByStatus.completed,
    skippedQueues: queuesByStatus.skipped
  };
};
