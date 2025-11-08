import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { createLogger } from '@/utils/logger';

const logger = createLogger('IntelligentDecisionPoint');

export interface QueueAnalysis {
  totalWaiting: number;
  urgentCount: number;
  elderlyCount: number;
  generalCount: number;
  appointmentCount: number;
  avgWaitTimeCurrent: number;
  bottleneckServicePoints: string[];
}

export interface AlgorithmRecommendation {
  recommended: string;
  reason: string;
  expectedImpact: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

export const useIntelligentDecisionPoint = () => {
  // Analyze current queue composition and performance
  const analyzeCurrentQueues = useCallback(async (): Promise<QueueAnalysis> => {
    logger.info('🔍 Analyzing current queue composition...');
    
    // Get waiting queues with service point info
    const { data: waitingQueues } = await supabase
      .from('queues')
      .select(`
        *,
        service_points(name, code)
      `)
      .eq('status', 'WAITING')
      .like('notes', '%ข้อมูลจำลองโรงพยาบาล%');

    // Get active queues to calculate current wait times
    const { data: activeQueues } = await supabase
      .from('queues')
      .select('*')
      .eq('status', 'ACTIVE')
      .like('notes', '%ข้อมูลจำลองโรงพยาบาล%');

    const totalWaiting = waitingQueues?.length || 0;
    const urgentCount = waitingQueues?.filter(q => q.type === 'URGENT').length || 0;
    const elderlyCount = waitingQueues?.filter(q => q.type === 'ELDERLY').length || 0;
    const generalCount = waitingQueues?.filter(q => q.type === 'GENERAL').length || 0;
    const appointmentCount = waitingQueues?.filter(q => q.type === 'APPOINTMENT').length || 0;

    // Calculate average wait time for active queues
    const avgWaitTimeCurrent = activeQueues?.reduce((sum, queue) => {
      if (queue.called_at && queue.created_at) {
        const wait = (new Date(queue.called_at).getTime() - new Date(queue.created_at).getTime()) / 60000;
        return sum + wait;
      }
      return sum;
    }, 0) / Math.max(activeQueues?.length || 1, 1);

    // Identify bottleneck service points
    const servicePointLoad: Record<string, number> = {};
    waitingQueues?.forEach(queue => {
      if (queue.service_points?.name) {
        servicePointLoad[queue.service_points.name] = (servicePointLoad[queue.service_points.name] || 0) + 1;
      }
    });

    const bottleneckServicePoints = Object.entries(servicePointLoad)
      .filter(([_, count]) => count > 5) // More than 5 waiting queues
      .map(([name, _]) => name);

    return {
      totalWaiting,
      urgentCount,
      elderlyCount,
      generalCount,
      appointmentCount,
      avgWaitTimeCurrent: Math.round(avgWaitTimeCurrent || 0),
      bottleneckServicePoints
    };
  }, []);

  // Generate intelligent algorithm recommendation based on queue analysis
  const generateRecommendation = useCallback((
    currentAlgorithm: string,
    analysis: QueueAnalysis,
    currentMetrics: any
  ): AlgorithmRecommendation => {
    logger.info('🤖 Generating intelligent algorithm recommendation...', { currentAlgorithm, analysis, currentMetrics });

    const { urgentCount, elderlyCount, generalCount, totalWaiting, avgWaitTimeCurrent, bottleneckServicePoints } = analysis;
    const { avgWaitTime, throughput } = currentMetrics;

    // High priority queue concentration
    const priorityRatio = (urgentCount + elderlyCount) / Math.max(totalWaiting, 1);
    const isHighPriorityLoad = priorityRatio > 0.3; // More than 30% priority queues

    // Performance issues
    const isSlowProcessing = avgWaitTime > 20 || throughput < 3;
    const hasBottlenecks = bottleneckServicePoints.length > 0;

    // Algorithm-specific recommendations
    if (currentAlgorithm === 'FIFO') {
      if (isHighPriorityLoad) {
        return {
          recommended: 'PRIORITY',
          reason: `มีคิวเร่งด่วน/ผู้สูงอายุ ${urgentCount + elderlyCount} คิว (${Math.round(priorityRatio * 100)}%) - ควรจัดลำดับความสำคัญ`,
          expectedImpact: `ลดเวลารอสำหรับคิวเร่งด่วนจาก ${avgWaitTimeCurrent} นาที เหลือ ~${Math.max(5, avgWaitTimeCurrent - 8)} นาที`,
          confidence: 'HIGH'
        };
      } else if (isSlowProcessing && totalWaiting > 15) {
        return {
          recommended: 'MULTILEVEL',
          reason: `ปริมาณคิวมาก (${totalWaiting} คิว) และประสิทธิภาพต่ำ - ต้องการอัลกอริธึมสมดุล`,
          expectedImpact: `เพิ่มประสิทธิภาพโดยรวม throughput จาก ${throughput} เป็น ~${throughput + 2} คิว`,
          confidence: 'HIGH'
        };
      }
    } else if (currentAlgorithm === 'PRIORITY') {
      if (!isHighPriorityLoad && generalCount > urgentCount + elderlyCount) {
        return {
          recommended: 'MULTILEVEL',
          reason: `คิวทั่วไปมากกว่าคิวเร่งด่วน (${generalCount} vs ${urgentCount + elderlyCount}) - ควรปรับสมดุล`,
          expectedImpact: `ลดเวลารอสำหรับคิวทั่วไปและเพิ่มความยุติธรรม`,
          confidence: 'MEDIUM'
        };
      } else if (throughput > 5 && totalWaiting < 10) {
        return {
          recommended: 'FIFO',
          reason: `ประสิทธิภาพดีแล้ว (${throughput} คิว) และคิวน้อย - FIFO เพียงพอ`,
          expectedImpact: `รักษาความเรียบง่ายและยุติธรรมตามลำดับ`,
          confidence: 'MEDIUM'
        };
      }
    } else if (currentAlgorithm === 'MULTILEVEL') {
      if (isHighPriorityLoad && avgWaitTime > 15) {
        return {
          recommended: 'PRIORITY',
          reason: `คิวเร่งด่วนมาก (${Math.round(priorityRatio * 100)}%) และรอนาน - ต้องเร่งความสำคัญ`,
          expectedImpact: `ลดเวลารอสำหรับคิวเร่งด่วนอย่างมีนัยสำคัญ`,
          confidence: 'HIGH'
        };
      } else if (totalWaiting < 8 && !hasBottlenecks) {
        return {
          recommended: 'FIFO',
          reason: `คิวน้อย (${totalWaiting} คิว) และไม่มีปัญหาคอขวด - FIFO เหมาะสม`,
          expectedImpact: `ความเรียบง่ายและประสิทธิภาพที่สม่ำเสมอ`,
          confidence: 'MEDIUM'
        };
      }
    }

    // Default recommendation - continue with current algorithm
    return {
      recommended: currentAlgorithm,
      reason: `อัลกอริธึมปัจจุบันเหมาะสมกับสถานการณ์ (เวลารอ: ${avgWaitTime} นาที, throughput: ${throughput} คิว)`,
      expectedImpact: `รักษาประสิทธิภาพปัจจุบันและความสม่ำเสมอ`,
      confidence: 'MEDIUM'
    };
  }, []);

  // Get contextual insights for the current situation
  const getContextualInsights = useCallback((analysis: QueueAnalysis, currentMetrics: any) => {
    const insights = [];

    if (analysis.urgentCount > 3) {
      insights.push({
        type: 'warning',
        message: `⚠️ มีคิวเร่งด่วน ${analysis.urgentCount} คิว - ควรพิจารณาจัดลำดับความสำคัญ`
      });
    }

    if (analysis.bottleneckServicePoints.length > 0) {
      insights.push({
        type: 'info',
        message: `🔍 จุดบริการที่คิวแน่น: ${analysis.bottleneckServicePoints.join(', ')}`
      });
    }

    if (currentMetrics.avgWaitTime > 25) {
      insights.push({
        type: 'error',
        message: `⏰ เวลารอเฉลี่ยสูงมาก (${currentMetrics.avgWaitTime} นาที) - ต้องปรับแต่งด่วน`
      });
    }

    if (currentMetrics.throughput < 3) {
      insights.push({
        type: 'warning',
        message: `📉 ประสิทธิภาพต่ำ (${currentMetrics.throughput} คิวต่อรอบ) - อาจมีปัญหาในระบบ`
      });
    }

    return insights;
  }, []);

  return {
    analyzeCurrentQueues,
    generateRecommendation,
    getContextualInsights
  };
};