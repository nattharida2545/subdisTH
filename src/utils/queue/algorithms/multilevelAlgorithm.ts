
import { supabase } from '@/integrations/supabase/client';
import { Queue } from '@/integrations/supabase/schema';
import { mapToQueueObject } from '../queueMapping';

// Multilevel algorithm implementation
export const applyMultilevelAlgorithm = async (
  waitingQueues: any[], 
  queueTypeMap: Record<string, any>
): Promise<Queue | null> => {
  const today = new Date().toISOString().split('T')[0];
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  
  // Get completed queues in the last hour
  const { data: completedQueues } = await supabase
    .from('queues')
    .select('type')
    .eq('queue_date', today)
    .eq('status', 'COMPLETED')
    .gte('completed_at', oneHourAgo);
    
  // Manually count completions by type
  const typeCompletionCounts: Record<string, number> = {};
  if (completedQueues) {
    completedQueues.forEach(q => {
      typeCompletionCounts[q.type] = (typeCompletionCounts[q.type] || 0) + 1;
    });
  }
  
  // Find queue types with lower completion rates
  const queueTypeFrequency = new Map<string, number>();
  waitingQueues.forEach(q => {
    const type = q.type;
    queueTypeFrequency.set(type, (queueTypeFrequency.get(type) || 0) + 1);
  });
  
  // Calculate scores for each queue
  const queuesWithScore = waitingQueues.map(q => {
    const waitingCountForType = queueTypeFrequency.get(q.type) || 0;
    const completedCountForType = typeCompletionCounts[q.type] || 0;
    // Look up the priority from our queue types map
    const queueTypeInfo = queueTypeMap[q.type] || { priority: 5 };
    const priority = queueTypeInfo.priority || 5;
    const waitTime = new Date().getTime() - new Date(q.created_at).getTime();
    
    // Score favors types with many waiting and few completed, high priority, and long wait time
    const score = 
      (waitingCountForType / (completedCountForType + 1)) * 
      priority * 
      (waitTime / 60000); // Convert ms to minutes
      
    return { ...q, score };
  });
  
  // Sort by score (highest first)
  return queuesWithScore.length > 0 ? 
    mapToQueueObject(queuesWithScore.sort((a, b) => b.score - a.score)[0]) : 
    null;
};
