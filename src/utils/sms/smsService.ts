
import { supabase } from '@/integrations/supabase/client';
import { Queue, ServicePoint, Patient } from '@/integrations/supabase/schema';
import { createLogger } from '@/utils/logger';
import { getMessageTemplate } from './smsSettings';
import { formatQueueNumber } from '@/utils/queueFormatters';

const logger = createLogger('smsService');

export const sendSmsToPatient = async (
  patient: Patient, 
  queue: Queue, 
  servicePoint?: ServicePoint
): Promise<boolean> => {
  try {
    if (!patient.phone) {
      logger.warn(`No phone number for patient ${patient.name} (Queue ${queue.number})`);
      return false;
    }

    // Format the queue number properly (A001, E007, etc.)
    const formattedQueueNumber = formatQueueNumber(queue.type as any, queue.number);

    // Get message template from settings
    const messageTemplate = await getMessageTemplate();
    const message = messageTemplate
      ? messageTemplate.replace('{queueNumber}', formattedQueueNumber)
      : `ท่านกำลังจะได้รับบริการในคิวถัดไป คิวหมายเลข ${formattedQueueNumber}`;

    const { data, error } = await supabase.functions.invoke('send-sms-notification', {
      body: {
        phoneNumber: patient.phone,
        message,
        queueNumber: formattedQueueNumber,
        patientName: patient.name
      }
    });

    if (error) {
      logger.error(`SMS error for queue ${formattedQueueNumber}:`, error);
      return false;
    }

    logger.info(`SMS sent successfully to queue ${formattedQueueNumber} (${patient.name})`);
    return true;
  } catch (error) {
    logger.error(`Error sending SMS to patient ${patient.name}:`, error);
    return false;
  }
};
