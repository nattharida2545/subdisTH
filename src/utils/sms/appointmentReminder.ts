
import { supabase } from '@/integrations/supabase/client';
import { createLogger } from '@/utils/logger';

const logger = createLogger('appointmentReminder');

export const sendAppointmentReminders = async (): Promise<{ success: boolean; message: string; sent: number }> => {
  try {
    logger.info('Triggering appointment reminder SMS...');
    
    const { data, error } = await supabase.functions.invoke('appointment-reminder-sms', {
      body: {}
    });

    if (error) {
      logger.error('Error invoking appointment reminder function:', error);
      throw error;
    }

    logger.info('Appointment reminder response:', data);
    return data;
  } catch (error) {
    logger.error('Error sending appointment reminders:', error);
    return {
      success: false,
      message: `Error: ${error.message}`,
      sent: 0
    };
  }
};
