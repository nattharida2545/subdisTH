import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { simulationLogger } from '@/utils/simulationLogger';
import { createLogger } from '@/utils/logger';

const logger = createLogger('ProgressiveQueueProcessing');

export interface QueueProcessingResult {
  processedCount: number;
  completedCount: number;
  remainingCount: number;
  metrics: {
    avgWaitTime: number;
    throughput: number;
    completedQueues: number;
  };
}

export const useProgressiveQueueProcessing = () => {
  // Process EXACTLY the specified percentage of total queues with TRUE PROGRESSIVE LOGIC
  const processQueuesByPercentage = useCallback(async (
    targetPercentage: number,
    currentPercentage: number,
    algorithm: string,
    servicePointMappings: any[]
  ): Promise<QueueProcessingResult> => {
    logger.info(`🎯 PROGRESSIVE PROCESSING: ${currentPercentage}% → ${targetPercentage}% using ${algorithm}`);
    
    // Get all simulation queues ordered by creation time (simplified query)
    logger.info('🔍 Fetching simulation queues...');
    const { data: allQueues, error: queryError } = await supabase
      .from('queues')
      .select('*')
      .like('notes', '%ข้อมูลจำลองโรงพยาบาล%')
      .order('created_at', { ascending: true });

    if (queryError) {
      logger.error('❌ Database query error:', queryError);
      throw new Error(`Database query failed: ${queryError.message}`);
    }

    if (!allQueues || allQueues.length === 0) {
      logger.warn('⚠️ No simulation queues found in database');
      
      // Check if there are any queues at all with simulation notes
      const { data: checkQueues, error: checkError } = await supabase
        .from('queues')
        .select('id, notes')
        .not('notes', 'is', null)
        .limit(5);
      
      if (checkError) {
        logger.error('❌ Check query error:', checkError);
      } else {
        logger.info('📊 Sample queue notes:', checkQueues?.map(q => q.notes));
      }
      
      throw new Error('No simulation queues found');
    }

    logger.info(`✅ Found ${allQueues.length} simulation queues`);

    const totalQueues = allQueues.length;
    const currentProcessedCount = Math.floor((currentPercentage / 100) * totalQueues);
    const targetProcessedCount = Math.floor((targetPercentage / 100) * totalQueues);
    const exactQueuesToProcess = targetProcessedCount - currentProcessedCount;

    logger.info(`📊 EXACT PROCESSING: Total=${totalQueues}, Current=${currentProcessedCount}, Target=${targetProcessedCount}, ToProcess=${exactQueuesToProcess}`);
    
    simulationLogger.log('PROGRESSIVE_PROCESSING_START', `PROCESSING_${targetPercentage}`, algorithm, {
      totalQueues,
      currentProcessedCount,
      targetProcessedCount,
      exactQueuesToProcess,
      algorithm,
      progressiveType: 'EXACT_PERCENTAGE'
    });

    // Get EXACTLY the number of waiting queues we need to process
    const waitingQueues = allQueues.filter(q => q.status === 'WAITING');
    
    if (waitingQueues.length === 0) {
      logger.info('No waiting queues to process');
      return {
        processedCount: 0,
        completedCount: 0,
        remainingCount: 0,
        metrics: await calculateCurrentMetrics()
      };
    }

    // Take EXACTLY the number of queues we need to process
    const exactQueuesToProcessNow = Math.min(exactQueuesToProcess, waitingQueues.length);
    const selectedQueues = waitingQueues.slice(0, exactQueuesToProcessNow);

    logger.info(`🎯 Processing EXACTLY ${selectedQueues.length} queues out of ${waitingQueues.length} waiting`);

    // Apply algorithm-specific processing to selected queues
    const processedQueues = await applyAlgorithmProcessing(selectedQueues, algorithm, servicePointMappings);
    
    // Complete some active queues to reach target completion percentage
    const completedCount = await completeActiveQueues(algorithm, targetPercentage, totalQueues);

    const metrics = await calculateCurrentMetrics();
    
    simulationLogger.log('PROGRESSIVE_PROCESSING_COMPLETE', `PROCESSING_${targetPercentage}`, algorithm, {
      exactlyProcessed: processedQueues.length,
      completedCount,
      remainingWaiting: waitingQueues.length - processedQueues.length,
      metrics,
      progressiveType: 'EXACT_PERCENTAGE'
    });

    return {
      processedCount: processedQueues.length,
      completedCount,
      remainingCount: waitingQueues.length - processedQueues.length,
      metrics
    };
  }, []);

  // Apply algorithm-specific processing logic with service point awareness
  const applyAlgorithmProcessing = useCallback(async (
    waitingQueues: any[],
    algorithm: string,
    servicePointMappings: any[]
  ) => {
    logger.info(`Applying ${algorithm} algorithm to ${waitingQueues.length} queues`);
    
    let processedQueues: any[] = [];
    
    switch (algorithm) {
      case 'FIFO':
        // First In, First Out - strict chronological order
        processedQueues = waitingQueues
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
        
      case 'PRIORITY':
        // Priority-based - URGENT and ELDERLY first
        processedQueues = waitingQueues
          .sort((a, b) => {
            const aPriority = getPriorityScore(a.type);
            const bPriority = getPriorityScore(b.type);
            if (aPriority !== bPriority) return aPriority - bPriority;
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          });
        break;
        
      case 'MULTILEVEL':
        // Balanced round-robin processing across queue types
        processedQueues = balanceQueueTypes(waitingQueues);
        break;
        
      default:
        processedQueues = waitingQueues;
    }

    // Process queues with service point assignment and realistic wait times
    const updatePromises = processedQueues.map(async (queue) => {
      const servicePoint = findServicePointForQueue(queue, servicePointMappings);
      const baseWaitTime = getAlgorithmWaitTimeReduction(algorithm, queue.type);
      
      // Calculate realistic called_at time (created_at + base wait time + random variation)
      const createdTime = new Date(queue.created_at).getTime();
      const waitTimeMinutes = Math.max(1, baseWaitTime + Math.random() * 5); // Minimum 1 minute, add random variation
      const calledAtTime = createdTime + (waitTimeMinutes * 60000);
      const adjustedCalledAt = new Date(calledAtTime);
      
      simulationLogger.logQueueStateChange(queue.id, 'WAITING', 'ACTIVE', algorithm, `PROCESSING_${algorithm}`);
      
      return supabase
        .from('queues')
        .update({
          status: 'ACTIVE',
          called_at: adjustedCalledAt.toISOString(),
          service_point_id: servicePoint?.id || queue.service_point_id
        })
        .eq('id', queue.id);
    });

    await Promise.all(updatePromises);
    return processedQueues;
  }, []);

  // Complete active queues with algorithm-specific completion rates to reach target completion percentage
  const completeActiveQueues = useCallback(async (algorithm: string, targetPercentage: number, totalQueues: number): Promise<number> => {
    const { data: activeQueues } = await supabase
      .from('queues')
      .select('*')
      .eq('status', 'ACTIVE')
      .like('notes', '%ข้อมูลจำลองโรงพยาบาล%')
      .order('called_at', { ascending: true });

    if (!activeQueues || activeQueues.length === 0) return 0;

    // Calculate how many queues should be completed to reach target percentage
    const targetCompletedCount = Math.floor((targetPercentage / 100) * totalQueues);
    
    // Get current completed count
    const { data: currentCompleted } = await supabase
      .from('queues')
      .select('id')
      .eq('status', 'COMPLETED')
      .like('notes', '%ข้อมูลจำลองโรงพยาบาล%');
    
    const currentCompletedCount = currentCompleted?.length || 0;
    const needToComplete = Math.max(0, targetCompletedCount - currentCompletedCount);
    const queuesToComplete = Math.min(activeQueues.length, needToComplete);

    logger.info(`📊 COMPLETION LOGIC: Target=${targetCompletedCount}, Current=${currentCompletedCount}, Need=${needToComplete}, Will complete=${queuesToComplete}`);

    if (queuesToComplete <= 0) {
      logger.info('No additional queues need to be completed');
      return 0;
    }

    const selectedQueues = activeQueues.slice(0, queuesToComplete);
    
    const completePromises = selectedQueues.map(queue => {
      // Calculate realistic completed_at time (called_at + service time)
      const calledTime = new Date(queue.called_at).getTime();
      const serviceTimeMinutes = Math.max(2, 5 + Math.random() * 10); // 2-15 minutes service time
      const completedAtTime = calledTime + (serviceTimeMinutes * 60000);
      const completedAt = new Date(completedAtTime);
      
      simulationLogger.logQueueStateChange(queue.id, 'ACTIVE', 'COMPLETED', algorithm, `COMPLETION_${algorithm}`);
      
      return supabase
        .from('queues')
        .update({
          status: 'COMPLETED',
          completed_at: completedAt.toISOString()
        })
        .eq('id', queue.id);
    });

    await Promise.all(completePromises);
    return selectedQueues.length;
  }, []);

  const calculateCurrentMetrics = useCallback(async () => {
    const { data: completedQueues } = await supabase
      .from('queues')
      .select('*')
      .eq('status', 'COMPLETED')
      .like('notes', '%ข้อมูลจำลองโรงพยาบาล%');

    const avgWaitTime = completedQueues?.reduce((sum, queue) => {
      if (queue.called_at && queue.created_at) {
        const wait = (new Date(queue.called_at).getTime() - new Date(queue.created_at).getTime()) / 60000;
        return sum + wait;
      }
      return sum;
    }, 0) / Math.max(completedQueues?.length || 1, 1);

    return {
      avgWaitTime: Math.round(avgWaitTime || 0),
      throughput: completedQueues?.length || 0,
      completedQueues: completedQueues?.length || 0
    };
  }, []);

  return {
    processQueuesByPercentage
  };
};

// Helper functions
const getPriorityScore = (queueType: string): number => {
  switch (queueType) {
    case 'URGENT': return 0;
    case 'ELDERLY': return 1;
    case 'APPOINTMENT': return 2;
    case 'GENERAL': return 3;
    default: return 4;
  }
};

const balanceQueueTypes = (queues: any[]): any[] => {
  const typeGroups: Record<string, any[]> = {};
  queues.forEach(queue => {
    if (!typeGroups[queue.type]) typeGroups[queue.type] = [];
    typeGroups[queue.type].push(queue);
  });

  const balanced: any[] = [];
  const maxLen = Math.max(...Object.values(typeGroups).map(arr => arr.length));
  
  for (let i = 0; i < maxLen; i++) {
    Object.values(typeGroups).forEach(arr => {
      if (arr[i]) balanced.push(arr[i]);
    });
  }
  
  return balanced;
};

const findServicePointForQueue = (queue: any, mappings: any[]) => {
  const mapping = mappings.find(m => 
    m.queue_type_code === queue.type || 
    m.supports_all_types
  );
  return mapping?.service_point;
};

const getAlgorithmWaitTimeReduction = (algorithm: string, queueType: string): number => {
  // Return realistic base wait times (in minutes) instead of reductions
  switch (algorithm) {
    case 'PRIORITY':
      return queueType === 'URGENT' || queueType === 'ELDERLY' ? 3 : 8;
    case 'MULTILEVEL':
      return 6;
    case 'FIFO':
    default:
      return 10;
  }
};

const getAlgorithmCompletionRate = (algorithm: string): number => {
  switch (algorithm) {
    case 'PRIORITY': return 0.4; // 40% completion rate
    case 'MULTILEVEL': return 0.35; // 35% completion rate  
    case 'FIFO': return 0.25; // 25% completion rate
    default: return 0.2;
  }
};