
import { useCallback } from 'react';
import { toast } from 'sonner';
import { useQueueSimulation } from '@/hooks/queue/useQueueSimulation';
import { useQueueRecalculation } from '@/hooks/queue/useQueueRecalculation';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useTestDashboardActions');

export const useTestDashboardActions = (forceRefresh: () => void) => {
  const { simulateQueues, clearTestQueues } = useQueueSimulation();
  const { recalculateAllQueues } = useQueueRecalculation();

  const handleSimulate = useCallback(async () => {
    try {
      logger.info('Starting queue simulation');
      toast.loading('กำลังสร้างคิวทดสอบ...', { id: 'simulate' });
      await simulateQueues(15);
      toast.success('สร้างคิวทดสอบเรียบร้อยแล้ว', { id: 'simulate' });
      setTimeout(() => forceRefresh(), 500);
      logger.info('Queue simulation completed');
    } catch (error) {
      logger.error('Error during simulation:', error);
      toast.error('เกิดข้อผิดพลาดในการสร้างคิวทดสอบ', { id: 'simulate' });
    }
  }, [simulateQueues, forceRefresh]);

  const handleRecalculate = useCallback(async () => {
    try {
      logger.info('Starting queue recalculation');
      toast.loading('กำลังคำนวณการมอบหมายใหม่...', { id: 'recalculate' });
      await recalculateAllQueues();
      toast.success('คำนวณการมอบหมายใหม่เรียบร้อยแล้ว', { id: 'recalculate' });
      setTimeout(() => forceRefresh(), 500);
      logger.info('Queue recalculation completed');
    } catch (error) {
      logger.error('Error during recalculation:', error);
      toast.error('เกิดข้อผิดพลาดในการคำนวณการมอบหมายใหม่', { id: 'recalculate' });
    }
  }, [recalculateAllQueues, forceRefresh]);

  const handleClearQueues = useCallback(async () => {
    try {
      logger.info('Starting queue clearing');
      toast.loading('กำลังลบคิวทดสอบ...', { id: 'clear' });
      await clearTestQueues();
      toast.success('ลบคิวทดสอบเรียบร้อยแล้ว', { id: 'clear' });
      setTimeout(() => forceRefresh(), 500);
      logger.info('Test queues cleared');
    } catch (error) {
      logger.error('Error clearing test queues:', error);
      toast.error('เกิดข้อผิดพลาดในการลบคิวทดสอบ', { id: 'clear' });
    }
  }, [clearTestQueues, forceRefresh]);

  return {
    handleSimulate,
    handleRecalculate,
    handleClearQueues
  };
};
