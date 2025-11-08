import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { createLogger } from '@/utils/logger';
import { toast } from 'sonner';

const logger = createLogger('SimulationDataFixer');

export const useSimulationDataFixer = () => {
  const fixSimulationTimestamps = useCallback(async () => {
    try {
      logger.info('🔧 Starting simulation data timestamp fix...');
      toast.info('กำลังแก้ไขเวลาของข้อมูลจำลอง...');
      
      // Get all simulation queues
      const { data: queues, error } = await supabase
        .from('queues')
        .select('*')
        .like('notes', '%ข้อมูลจำลองโรงพยาบาล%')
        .order('created_at', { ascending: true });

      if (error) {
        logger.error('❌ Error fetching queues:', error);
        toast.error('เกิดข้อผิดพลาดในการดึงข้อมูล');
        return;
      }

      if (!queues || queues.length === 0) {
        toast.warning('ไม่มีข้อมูลจำลองให้แก้ไข');
        return;
      }

      // Create realistic timestamps for each queue
      const baseTime = new Date();
      baseTime.setHours(8, 0, 0, 0); // Start at 8 AM today
      
      const fixedQueues = queues.map((queue, index) => {
        // Spread queues over a realistic time period (e.g., 6 hours)
        const createdAt = new Date(baseTime.getTime() + (index * 3.6 * 60 * 1000)); // Every 3.6 minutes
        
        let calledAt = null;
        let completedAt = null;
        
        if (queue.status === 'ACTIVE' || queue.status === 'COMPLETED') {
          // Calculate realistic wait time based on queue type
          const waitTime = getRealisticWaitTime(queue.type);
          calledAt = new Date(createdAt.getTime() + waitTime * 60 * 1000);
        }
        
        if (queue.status === 'COMPLETED') {
          // Calculate realistic service time
          const serviceTime = getRealisticServiceTime(queue.type);
          completedAt = new Date(calledAt!.getTime() + serviceTime * 60 * 1000);
        }
        
        return {
          id: queue.id,
          created_at: createdAt.toISOString(),
          called_at: calledAt?.toISOString() || null,
          completed_at: completedAt?.toISOString() || null
        };
      });

      // Update queues in batches
      logger.info(`🔄 Updating ${fixedQueues.length} queue timestamps...`);
      
      const updatePromises = fixedQueues.map(queue => 
        supabase
          .from('queues')
          .update({
            created_at: queue.created_at,
            called_at: queue.called_at,
            completed_at: queue.completed_at
          })
          .eq('id', queue.id)
      );

      const results = await Promise.all(updatePromises);
      const errors = results.filter(result => result.error);
      
      if (errors.length > 0) {
        logger.error('❌ Some updates failed:', errors);
        toast.error(`แก้ไขไม่สำเร็จ ${errors.length} รายการ`);
      } else {
        logger.info(`✅ Successfully fixed ${fixedQueues.length} queue timestamps`);
        toast.success(`แก้ไขเวลาของข้อมูลจำลอง ${fixedQueues.length} รายการเรียบร้อย`);
      }
      
    } catch (error) {
      logger.error('❌ Error fixing timestamps:', error);
      toast.error('เกิดข้อผิดพลาดในการแก้ไขข้อมูล');
    }
  }, []);

  return {
    fixSimulationTimestamps
  };
};

// Helper functions for realistic wait and service times
const getRealisticWaitTime = (queueType: string): number => {
  switch (queueType) {
    case 'URGENT':
      return Math.random() * 5 + 1; // 1-6 minutes
    case 'ELDERLY':
      return Math.random() * 10 + 2; // 2-12 minutes
    case 'APPOINTMENT':
      return Math.random() * 8 + 3; // 3-11 minutes
    case 'GENERAL':
    default:
      return Math.random() * 15 + 5; // 5-20 minutes
  }
};

const getRealisticServiceTime = (queueType: string): number => {
  switch (queueType) {
    case 'URGENT':
      return Math.random() * 20 + 10; // 10-30 minutes
    case 'ELDERLY':
      return Math.random() * 15 + 8; // 8-23 minutes
    case 'APPOINTMENT':
      return Math.random() * 12 + 5; // 5-17 minutes
    case 'GENERAL':
    default:
      return Math.random() * 10 + 3; // 3-13 minutes
  }
};