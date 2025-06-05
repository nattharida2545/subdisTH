
import { useCallback } from 'react';
import { toast } from 'sonner';
import { useQueues } from '@/hooks/useQueues';
import { usePatients } from '@/hooks/usePatients';
import { useQueueTypes } from '@/hooks/useQueueTypes';
import { useServicePoints } from '@/hooks/useServicePoints';
import { useAllServicePointQueueTypes } from '@/hooks/useServicePointQueueTypes';
import { useQueueValidation } from './simulation/useQueueValidation';
import { useQueueNumbers } from './simulation/useQueueNumbers';
import { useServicePointAssignment } from './simulation/useServicePointAssignment';
import { useQueueCreation } from './simulation/useQueueCreation';
import { useQueueClearance } from './simulation/useQueueClearance';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useQueueSimulation');

export const useQueueSimulation = () => {
  const { fetchQueues } = useQueues();
  const { patients } = usePatients();
  const { queueTypes } = useQueueTypes();
  const { servicePoints } = useServicePoints();
  const { mappings } = useAllServicePointQueueTypes();

  const { validateQueueData } = useQueueValidation();
  const { getNextQueueNumbers } = useQueueNumbers();
  const { findServicePointForQueueType } = useServicePointAssignment();
  const { createTestQueues, insertQueues } = useQueueCreation();
  const { clearTestQueues: clearTestQueuesUtil } = useQueueClearance();

  const simulateQueues = useCallback(async (count: number = 15) => {
    try {
      logger.info('Starting queue simulation...');
      toast.info(`กำลังสร้างคิวทดสอบ ${count} คิว...`);

      const { isValid, enabledQueueTypes, enabledServicePoints } = validateQueueData(
        patients,
        queueTypes,
        servicePoints
      );

      if (!isValid) return;

      logger.info(`Using ${mappings.length} service point mappings`);

      // Get next queue numbers for each queue type
      const queueNumbers = await getNextQueueNumbers(enabledQueueTypes);

      // Helper function to find service point for queue type
      const findServicePoint = (queueType: any) => 
        findServicePointForQueueType(queueType, mappings, enabledServicePoints);

      // Create test queues with service point assignment
      const newQueues = createTestQueues(
        count,
        enabledQueueTypes,
        patients,
        queueNumbers,
        findServicePoint
      );

      // Insert all queues with better error handling
      const data = await insertQueues(newQueues);

      if (data) {
        // Refresh queue data
        await fetchQueues();
      }

    } catch (error) {
      logger.error('Error simulating queues:', error);
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
      toast.error(`เกิดข้อผิดพลาดในการสร้างคิวทดสอบ: ${errorMessage}`);
    }
  }, [patients, queueTypes, servicePoints, mappings, fetchQueues, validateQueueData, getNextQueueNumbers, findServicePointForQueueType, createTestQueues, insertQueues]);

  const clearTestQueues = useCallback(async () => {
    await clearTestQueuesUtil();
    await fetchQueues();
  }, [clearTestQueuesUtil, fetchQueues]);

  return {
    simulateQueues,
    clearTestQueues
  };
};
