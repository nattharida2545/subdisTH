import { useCallback } from "react";
import { toast } from "sonner";
import { createLogger } from "@/utils/logger";
import { checkSmsEnabled, getMessageTemplate } from "@/utils/sms/smsSettings";
import { sendSmsToPatient, sendSmsToInsQueue } from "@/utils/sms/smsService";
import {
  getNext3WaitingQueues,
  getNextQueuesPerServicePoint,
  getNext3WaitingQueuesIns,
} from "@/utils/sms/queueFetching";

const logger = createLogger("useSmsNotifications");

export const useSmsNotifications = () => {
  // Send SMS notifications to next 3 queues globally
  const sendSmsToNextQueues = useCallback(async (): Promise<void> => {
    try {
      // Check if SMS is enabled
      const smsEnabled = await checkSmsEnabled();
      if (!smsEnabled) {
        logger.info("SMS notifications are disabled");
        return;
      }

      logger.info("Starting SMS notifications for next 3 queues...");

      // Get the next 3 waiting queues globally
      const queuePatientPairs = await getNext3WaitingQueues();

      if (queuePatientPairs.length === 0) {
        logger.info("No waiting queues found");
        return;
      }

      let totalSent = 0;
      const totalQueues = queuePatientPairs.length;

      // Send SMS to each queue-patient pair
      for (const { queue, patient, servicePoint } of queuePatientPairs) {
        if (queue.noti_at) {
          continue;
        }
        const success = await sendSmsToPatient(patient, queue, servicePoint);
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
      logger.error("Error in sendSmsToNextQueues:", error);
      toast.error("เกิดข้อผิดพลาดในการส่ง SMS แจ้งเตือน");
    }
  }, []);

  // Send SMS notifications to next 3 INS queues globally
  const sendSmsToNextQueueIns = useCallback(async (): Promise<void> => {
    try {
      const smsEnabled = await checkSmsEnabled();
      if (!smsEnabled) {
        logger.info("SMS notifications are disabled");
        return;
      }

      logger.info("Starting SMS notifications for next 3 INS queues...");

      const queuePairs = await getNext3WaitingQueuesIns();
      if (queuePairs.length === 0) {
        logger.info("No waiting INS queues found");
        return;
      }

      let totalSent = 0;
      const totalQueues = queuePairs.length;

      for (const { queue, servicePoint } of queuePairs) {
        if (queue.noti_at) continue;
        const success = await sendSmsToInsQueue(queue, servicePoint);
        if (success) totalSent++;
      }

      const message = `ส่ง SMS แจ้งเตือนไปยัง ${totalSent}/${totalQueues} คิว (INS)`;
      if (totalSent > 0) toast.success(message);
      logger.info(message);
    } catch (error) {
      logger.error("Error in sendSmsToNextQueueIns:", error);
      toast.error("เกิดข้อผิดพลาดในการส่ง SMS แจ้งเตือน (INS)");
    }
  }, []);

  return {
    sendSmsToNextQueues,
    sendSmsToNextQueueIns,
    getNextQueuesPerServicePoint,
    getNext3WaitingQueues,
    sendSmsToPatient,
    checkSmsEnabled,
    getMessageTemplate,
  };
};
