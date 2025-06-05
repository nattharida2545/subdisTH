
import { Queue } from '@/integrations/supabase/schema';
import { mapToQueueObject } from '../queueMapping';

// Multilevel feedback algorithm implementation
export const applyMultilevelFeedbackAlgorithm = (
  waitingQueues: any[], 
  queueTypeMap: Record<string, any>
): Queue | null => {
  // Calculate a score based on wait time and priority
  const queuesWithFeedbackScore = waitingQueues.map(q => {
    const waitTimeMs = new Date().getTime() - new Date(q.created_at).getTime();
    const waitTimeMinutes = waitTimeMs / 60000;
    // Look up the priority from our queue types map
    const queueTypeInfo = queueTypeMap[q.type] || { priority: 5 };
    const priority = queueTypeInfo.priority || 5;
    
    // Waiting time gets more weight over time - after certain thresholds, priority increases
    let effectivePriority = priority;
    if (waitTimeMinutes > 30) effectivePriority += 2;
    else if (waitTimeMinutes > 15) effectivePriority += 1;
    
    // Final score is a combination of effective priority and wait time
    const feedbackScore = effectivePriority * Math.log10(1 + waitTimeMinutes);
    
    return { ...q, feedbackScore };
  });
  
  // Sort by feedback score (highest first)
  return queuesWithFeedbackScore.length > 0 ?
    mapToQueueObject(queuesWithFeedbackScore.sort((a, b) => b.feedbackScore - a.feedbackScore)[0]) :
    null;
};
