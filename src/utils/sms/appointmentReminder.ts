
import { supabase } from '@/integrations/supabase/client';
import { createLogger } from '@/utils/logger';

const logger = createLogger('appointmentReminder');

export const sendAppointmentReminders = async (): Promise<{ success: boolean; message: string; sent: number }> => {
  try {
    logger.info('Manually triggering appointment reminder SMS...');
    
    const { data, error } = await supabase.functions.invoke('appointment-reminder-sms', {
      body: { manual_trigger: true }
    });

    if (error) {
      logger.error('Error invoking appointment reminder function:', error);
      throw error;
    }

    logger.info('Appointment reminder response:', data);
    
    if (data && data.success) {
      return {
        success: true,
        message: data.message || `ส่ง SMS แจ้งเตือนนัดหมายสำเร็จ`,
        sent: data.sent || 0
      };
    } else {
      return {
        success: false,
        message: data?.message || 'ไม่สามารถส่ง SMS แจ้งเตือนได้',
        sent: 0
      };
    }
  } catch (error: any) {
    logger.error('Error sending appointment reminders:', error);
    return {
      success: false,
      message: `เกิดข้อผิดพลาด: ${error.message}`,
      sent: 0
    };
  }
};
