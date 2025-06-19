
import { supabase } from '@/integrations/supabase/client';
import { Queue, ServicePoint, Patient } from '@/integrations/supabase/schema';
import { createLogger } from '@/utils/logger';
import { getMessageTemplate } from './smsSettings';

const logger = createLogger('smsService');

export const sendSmsToPatient = async (
  patient: Patient, 
  queue: Queue, 
  servicePoint: ServicePoint
): Promise<boolean> => {
  try {
    if (!patient.phone) {
      logger.warn(`No phone number for patient ${patient.name} (Queue ${queue.number})`);
      return false;
    }

    // Get message template from settings
    const messageTemplate = await getMessageTemplate();
    const message = messageTemplate
      ? messageTemplate.replace('{queueNumber}', queue.number.toString())
      : `ท่านกำลังจะได้รับบริการในคิวถัดไป คิวหมายเลข ${queue.number}`;

    const { data, error } = await supabase.functions.invoke('send-sms-notification', {
      body: {
        phoneNumber: patient.phone,
        message,
        queueNumber: queue.number.toString(),
        patientName: patient.name
      }
    });

    if (error) {
      logger.error(`SMS error for queue ${queue.number}:`, error);
      return false;
    }

    logger.info(`SMS sent successfully to queue ${queue.number} (${patient.name})`);
    return true;
  } catch (error) {
    logger.error(`Error sending SMS to patient ${patient.name}:`, error);
    return false;
  }
};
