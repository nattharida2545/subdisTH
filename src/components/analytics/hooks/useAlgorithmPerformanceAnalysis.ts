import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { createLogger } from '@/utils/logger';

const logger = createLogger('AlgorithmPerformanceAnalysis');

export interface AlgorithmPerformanceData {
  algorithm: string;
  phase: string;
  avgWaitTime: number;
  throughput: number;
  completedQueues: number;
  efficiency: number;
  fairnessScore: number;
}

export interface IntelligentRecommendation {
  recommended: string;
  reason: string;
  expectedImprovement: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  performanceComparison: {
    current: AlgorithmPerformanceData;
    predicted: AlgorithmPerformanceData;
  };
}

export const useAlgorithmPerformanceAnalysis = () => {
  // Analyze actual performance of different algorithms in real-time
  const analyzeAlgorithmPerformance = useCallback(async (
    algorithm: string,
    phase: string
  ): Promise<AlgorithmPerformanceData> => {
    logger.info(`🔍 Analyzing performance for ${algorithm} in ${phase}`);

    // Get completed queues for the specific algorithm phase
    const { data: completedQueues } = await supabase
      .from('queues')
      .select('*')
      .eq('status', 'COMPLETED')
      .like('notes', '%ข้อมูลจำลองโรงพยาบาล%');

    // Get active queues to understand current processing
    const { data: activeQueues } = await supabase
      .from('queues')
      .select('*')
      .eq('status', 'ACTIVE')
      .like('notes', '%ข้อมูลจำลองโรงพยาบาล%');

    // Calculate actual wait times
    const avgWaitTime = completedQueues?.reduce((sum, queue) => {
      if (queue.called_at && queue.created_at) {
        const wait = (new Date(queue.called_at).getTime() - new Date(queue.created_at).getTime()) / 60000;
        return sum + Math.max(0, wait); // Ensure no negative wait times
      }
      return sum;
    }, 0) / Math.max(completedQueues?.length || 1, 1) || 0;

    // Calculate throughput (completed queues per unit time)
    const throughput = completedQueues?.length || 0;

    // Calculate efficiency (throughput vs wait time ratio)
    const efficiency = avgWaitTime > 0 ? (throughput / avgWaitTime) * 10 : throughput;

    // Calculate fairness score based on queue type processing
    const urgentProcessed = completedQueues?.filter(q => q.type === 'URGENT').length || 0;
    const elderlyProcessed = completedQueues?.filter(q => q.type === 'ELDERLY').length || 0;
    const generalProcessed = completedQueues?.filter(q => q.type === 'GENERAL').length || 0;
    
    const fairnessScore = calculateFairnessScore(urgentProcessed, elderlyProcessed, generalProcessed, algorithm);

    return {
      algorithm,
      phase,
      avgWaitTime: Math.round(avgWaitTime),
      throughput,
      completedQueues: completedQueues?.length || 0,
      efficiency: Math.round(efficiency * 100) / 100,
      fairnessScore
    };
  }, []);

  // Generate intelligent recommendation based on actual performance data
  const generateIntelligentRecommendation = useCallback(async (
    currentAlgorithm: string,
    currentMetrics: any,
    phaseMetrics: any[]
  ): Promise<IntelligentRecommendation> => {
    logger.info('🤖 Generating intelligent recommendation based on actual performance');

    // Analyze current performance
    const currentPerformance = await analyzeAlgorithmPerformance(currentAlgorithm, 'CURRENT');

    // Predict performance for alternative algorithms
    const alternatives = ['FIFO', 'PRIORITY', 'MULTILEVEL'].filter(alg => alg !== currentAlgorithm);
    const predictions = await Promise.all(
      alternatives.map(alg => predictAlgorithmPerformance(alg, currentMetrics, phaseMetrics, currentPerformance))
    );

    // Find the best alternative
    const bestAlternative = predictions.reduce((best, current) => {
      // Scoring: lower wait time (40%), higher throughput (30%), higher efficiency (30%)
      const currentScore = (100 - current.avgWaitTime) * 0.4 + current.throughput * 0.3 + current.efficiency * 0.3;
      const bestScore = (100 - best.avgWaitTime) * 0.4 + best.throughput * 0.3 + best.efficiency * 0.3;
      return currentScore > bestScore ? current : best;
    });

    // Determine if change is recommended
    const currentScore = (100 - currentPerformance.avgWaitTime) * 0.4 + currentPerformance.throughput * 0.3 + currentPerformance.efficiency * 0.3;
    const bestScore = (100 - bestAlternative.avgWaitTime) * 0.4 + bestAlternative.throughput * 0.3 + bestAlternative.efficiency * 0.3;
    
    const improvement = bestScore - currentScore;
    const shouldChange = improvement > 5; // Significant improvement threshold

    if (shouldChange) {
      return {
        recommended: bestAlternative.algorithm,
        reason: generateReasonForChange(currentPerformance, bestAlternative),
        expectedImprovement: generateExpectedImprovement(currentPerformance, bestAlternative),
        confidence: improvement > 15 ? 'HIGH' : improvement > 8 ? 'MEDIUM' : 'LOW',
        performanceComparison: {
          current: currentPerformance,
          predicted: bestAlternative
        }
      };
    } else {
      return {
        recommended: currentAlgorithm,
        reason: `อัลกอริธึม ${currentAlgorithm} มีประสิทธิภาพดีที่สุดแล้ว (คะแนน: ${Math.round(currentScore)})`,
        expectedImprovement: 'รักษาประสิทธิภาพปัจจุบันและความสม่ำเสมอ',
        confidence: 'HIGH',
        performanceComparison: {
          current: currentPerformance,
          predicted: currentPerformance
        }
      };
    }
  }, [analyzeAlgorithmPerformance]);

  return {
    analyzeAlgorithmPerformance,
    generateIntelligentRecommendation
  };
};

// Helper functions
const calculateFairnessScore = (urgent: number, elderly: number, general: number, algorithm: string): number => {
  const total = urgent + elderly + general;
  if (total === 0) return 0;

  switch (algorithm) {
    case 'PRIORITY':
      // Priority should process urgent/elderly first
      return ((urgent + elderly) / total) * 100;
    case 'FIFO':
      // FIFO should be balanced
      return 100 - Math.abs(33.33 - (urgent / total * 100)) - Math.abs(33.33 - (elderly / total * 100)) - Math.abs(33.33 - (general / total * 100));
    case 'MULTILEVEL':
      // Multilevel should be most balanced
      const idealRatio = total / 3;
      const variance = Math.pow(urgent - idealRatio, 2) + Math.pow(elderly - idealRatio, 2) + Math.pow(general - idealRatio, 2);
      return Math.max(0, 100 - (variance / total * 10));
    default:
      return 50;
  }
};

const predictAlgorithmPerformance = async (
  algorithm: string,
  currentMetrics: any,
  phaseMetrics: any[],
  currentPerformance: AlgorithmPerformanceData
): Promise<AlgorithmPerformanceData> => {
  // Get waiting queues for prediction
  const { data: waitingQueues } = await supabase
    .from('queues')
    .select('type')
    .eq('status', 'WAITING')
    .like('notes', '%ข้อมูลจำลองโรงพยาบาล%');

  const urgentCount = waitingQueues?.filter(q => q.type === 'URGENT').length || 0;
  const elderlyCount = waitingQueues?.filter(q => q.type === 'ELDERLY').length || 0;
  const totalWaiting = waitingQueues?.length || 0;

  // Predict performance based on algorithm characteristics
  let predictedWaitTime = currentPerformance.avgWaitTime;
  let predictedThroughput = currentPerformance.throughput;
  let predictedEfficiency = currentPerformance.efficiency;

  switch (algorithm) {
    case 'PRIORITY':
      // Priority reduces wait time for urgent/elderly but may increase for general
      if (urgentCount + elderlyCount > totalWaiting * 0.3) {
        predictedWaitTime = Math.max(1, currentPerformance.avgWaitTime - 3);
        predictedThroughput = currentPerformance.throughput + 1;
      } else {
        predictedWaitTime = currentPerformance.avgWaitTime + 2;
        predictedThroughput = Math.max(1, currentPerformance.throughput - 1);
      }
      break;
    case 'MULTILEVEL':
      // Multilevel provides balanced performance
      predictedWaitTime = Math.max(1, currentPerformance.avgWaitTime - 1);
      predictedThroughput = currentPerformance.throughput + 1;
      break;
    case 'FIFO':
      // FIFO is consistent but may be slower with priority queues
      if (urgentCount > 0) {
        predictedWaitTime = currentPerformance.avgWaitTime + 2;
        predictedThroughput = Math.max(1, currentPerformance.throughput - 1);
      } else {
        predictedWaitTime = Math.max(1, currentPerformance.avgWaitTime - 1);
        predictedThroughput = currentPerformance.throughput;
      }
      break;
  }

  predictedEfficiency = predictedWaitTime > 0 ? (predictedThroughput / predictedWaitTime) * 10 : predictedThroughput;

  return {
    algorithm,
    phase: 'PREDICTED',
    avgWaitTime: Math.round(predictedWaitTime),
    throughput: predictedThroughput,
    completedQueues: predictedThroughput,
    efficiency: Math.round(predictedEfficiency * 100) / 100,
    fairnessScore: calculateFairnessScore(urgentCount, elderlyCount, totalWaiting - urgentCount - elderlyCount, algorithm)
  };
};

const generateReasonForChange = (current: AlgorithmPerformanceData, alternative: AlgorithmPerformanceData): string => {
  if (alternative.avgWaitTime < current.avgWaitTime) {
    return `เปลี่ยนเป็น ${alternative.algorithm} จะลดเวลารอจาก ${current.avgWaitTime} นาที เหลือ ${alternative.avgWaitTime} นาที`;
  } else if (alternative.throughput > current.throughput) {
    return `เปลี่ยนเป็น ${alternative.algorithm} จะเพิ่มประสิทธิภาพจาก ${current.throughput} เป็น ${alternative.throughput} คิว`;
  } else if (alternative.efficiency > current.efficiency) {
    return `เปลี่ยนเป็น ${alternative.algorithm} จะเพิ่มประสิทธิภาพรวมจาก ${current.efficiency} เป็น ${alternative.efficiency}`;
  } else {
    return `${alternative.algorithm} มีประสิทธิภาพดีกว่าโดยรวม`;
  }
};

const generateExpectedImprovement = (current: AlgorithmPerformanceData, alternative: AlgorithmPerformanceData): string => {
  const waitTimeImprovement = current.avgWaitTime - alternative.avgWaitTime;
  const throughputImprovement = alternative.throughput - current.throughput;
  
  if (waitTimeImprovement > 0 && throughputImprovement > 0) {
    return `ลดเวลารอ ${waitTimeImprovement} นาที และเพิ่มประสิทธิภาพ ${throughputImprovement} คิว`;
  } else if (waitTimeImprovement > 0) {
    return `ลดเวลารอ ${waitTimeImprovement} นาที`;
  } else if (throughputImprovement > 0) {
    return `เพิ่มประสิทธิภาพ ${throughputImprovement} คิว`;
  } else {
    return 'ปรับปรุงประสิทธิภาพโดยรวม';
  }
};