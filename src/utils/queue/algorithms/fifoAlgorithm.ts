
import { Queue } from '@/integrations/supabase/schema';
import { mapToQueueObject } from '../queueMapping';

// FIFO algorithm implementation
export const applyFifoAlgorithm = (waitingQueues: any[]): Queue | null => {
  if (waitingQueues.length === 0) {
    return null;
  }
  
  const sorted = [...waitingQueues]
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  
  // Ensure we return a properly typed Queue object
  return sorted.length > 0 ? mapToQueueObject(sorted[0]) : null;
};
