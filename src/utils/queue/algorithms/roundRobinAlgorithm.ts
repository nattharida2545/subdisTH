
import { Queue } from '@/integrations/supabase/schema';
import { mapToQueueObject } from '../queueMapping';

// Round-Robin algorithm implementation - distributes queues based on time spent waiting
export const applyRoundRobinAlgorithm = (
  waitingQueues: any[],
  queueTypeMap: Record<string, any>
): Queue | null => {
  if (waitingQueues.length === 0) {
    return null;
  }
  
  // Group queues by their type
  const queuesByType = waitingQueues.reduce((groups: Record<string, any[]>, queue) => {
    const type = queue.type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(queue);
    return groups;
  }, {});

  // Sort each queue type by creation time (oldest first)
  Object.keys(queuesByType).forEach(type => {
    queuesByType[type].sort((a: any, b: any) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  });

  // Get the oldest queue from each type
  const oldestFromEachType = Object.values(queuesByType)
    .map((queues: any[]) => queues[0])
    .filter(Boolean);

  // If we have queues, return the absolute oldest one
  return oldestFromEachType.length > 0 ?
    mapToQueueObject(
      oldestFromEachType.sort((a: any, b: any) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )[0]
    ) :
    null;
};
