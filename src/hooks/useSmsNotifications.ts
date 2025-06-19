
import { useCallback } from 'react';
import { toast } from 'sonner';
import { createLogger } from '@/utils/logger';
import { checkSmsEnabled, getMessageTemplate } from '@/utils/sms/smsSettings';
import { sendSmsToPatient } from '@/utils/sms/smsService';
import { getNextQueuesPerServicePoint } from '@/utils/sms/queueFetching';

const logger = createLogger('useSmsNotifications');

export const useSmsNotifications = () => {
  // Send SMS notifications to next 3 queues for all service points
  const sendSmsToNextQueues = useCallback(async (): Promise<void> => {
    try {
      // Check if SMS is enabled
      const smsEnabled = await checkSmsEnabled();
      if (!smsEnabled) {
        logger.info('SMS notifications are disabled');
        return;
      }

      logger.info('Starting SMS notifications for next queues...');
      
      const servicePointData = await getNextQueuesPerServicePoint();
      
      if (servicePointData.length === 0) {
        logger.info('No service points with waiting queues found');
        return;
      }

      let totalSent = 0;
      let totalQueues = 0;

      for (const { servicePoint, queues, patients } of servicePointData) {
        logger.info(`Processing ${queues.length} queues for service point: ${servicePoint.name}`);
        
        for (let i = 0; i < Math.min(queues.length, patients.length, 3); i++) {
          const queue = queues[i];
          const patient = patients[i];
          
          totalQueues++;
          const success = await sendSmsToPatient(patient, queue, servicePoint);
          if (success) {
            totalSent++;
          }
        }
      }

      const message = `ส่ง SMS แจ้งเตือนไปยัง ${totalSent}/${totalQueues} คิว`;
      if (totalSent > 0) {
        toast.success(message);
      }
      logger.info(message);

    } catch (error) {
      logger.error('Error in sendSmsToNextQueues:', error);
      toast.error('เกิดข้อผิดพลาดในการส่ง SMS แจ้งเตือน');
    }
  }, []);

  return {
    sendSmsToNextQueues,
    getNextQueuesPerServicePoint,
    sendSmsToPatient,
    checkSmsEnabled,
    getMessageTemplate
  };
};
