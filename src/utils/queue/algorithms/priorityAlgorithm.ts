
import { Queue } from '@/integrations/supabase/schema';
import { mapToQueueObject } from '../queueMapping';

// Priority algorithm implementation
export const applyPriorityAlgorithm = (
  waitingQueues: any[],
  queueTypeMap: Record<string, any>
): Queue | null => {
  const queuesWithPriority = waitingQueues.map(q => {
    // Look up the priority from our queue types map
    const queueTypeInfo = queueTypeMap[q.type] || { priority: 5 };
    return {
      ...q,
      calculatedPriority: queueTypeInfo.priority || 5
    };
  });
  
  const sortedByPriority = [...queuesWithPriority].sort((a, b) => {
    // Sort by priority (high to low)
    if (b.calculatedPriority !== a.calculatedPriority) {
      return b.calculatedPriority - a.calculatedPriority;
    }
    // Then by creation time
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });
  
  return sortedByPriority.length > 0 ? mapToQueueObject(sortedByPriority[0]) : null;
};
