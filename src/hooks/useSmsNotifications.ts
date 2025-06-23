
import { useCallback } from 'react';
import { toast } from 'sonner';
import { createLogger } from '@/utils/logger';
import { checkSmsEnabled, getMessageTemplate } from '@/utils/sms/smsSettings';
import { sendSmsToPatient } from '@/utils/sms/smsService';
import { getNext3WaitingQueues, getNextQueuesPerServicePoint } from '@/utils/sms/queueFetching';

const logger = createLogger('useSmsNotifications');

export const useSmsNotifications = () => {
  // Send SMS notifications to next 3 queues globally
  const sendSmsToNextQueues = useCallback(async (): Promise<void> => {
    try {
      // Check if SMS is enabled
      const smsEnabled = await checkSmsEnabled();
      if (!smsEnabled) {
        logger.info('SMS notifications are disabled');
        return;
      }

      logger.info('Starting SMS notifications for next 3 queues...');
      
      // Get the next 3 waiting queues globally
      const queuePatientPairs = await getNext3WaitingQueues();
      
      if (queuePatientPairs.length === 0) {
        logger.info('No waiting queues found');
        return;
      }

      let totalSent = 0;
      const totalQueues = queuePatientPairs.length;

      // Send SMS to each queue-patient pair
      for (const { queue, patient } of queuePatientPairs) {
        const success = await sendSmsToPatient(patient, queue);
        if (success) {
          totalSent++;
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
    getNext3WaitingQueues,
    sendSmsToPatient,
    checkSmsEnabled,
    getMessageTemplate
  };
};
