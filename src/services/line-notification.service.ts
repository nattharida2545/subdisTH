// src/services/line-notification.service.ts
import axios from 'axios';
import { Queue } from '@/integrations/supabase/schema';
import { supabase } from '@/integrations/supabase/client';

class LineNotificationService {
  /**
   * Sends a notification to a patient that their queue will be called soon
   */
  async sendQueueNotification(patientId: string, queue: Queue, estimatedWaitTime: number): Promise<boolean> {
    try {
      // Get both line_id and line_user_id for debugging
      const { data, error } = await supabase
        .from('patients')
        .select('line_id, line_user_id')  // Select both fields
        .eq('id', patientId)
        .single();
      
      if (error) {
        console.error('Error fetching patient LINE information:', error);
        return false;
      }

      // Log both values for debugging
      console.log('Patient data:', data);
      console.log('line_id:', data.line_id);
      console.log('line_user_id:', data.line_user_id);
      
      // Use line_user_id if available (the one that starts with 'U')
      // If not available, fall back to line_id (but this will likely fail)
      const lineUserId = data.line_user_id || data.line_id;
      
      // Check if we have any LINE ID to send to
      if (!lineUserId) {
        console.error('No LINE user ID found for patient');
        return false;
      }
      
      // Validate LINE user ID format (should start with 'U')
      if (!lineUserId.startsWith('U')) {
        console.warn('LINE user ID does not start with U:', lineUserId);
      }
      
      console.log(`Sending queue notification to LINE user ID: ${lineUserId}`);
      
      const response = await axios.post('/api/line-send-notification', {
        lineUserId,  // This will be the correct line_user_id value
        message: this.createQueueNotificationMessage(queue, estimatedWaitTime),
        queueId: queue.id
      });
      
      return response.status === 200;
    } catch (error) {
      console.error('Error sending LINE notification:', error);
      return false;
    }
  }

  /**
   * Sends a notification that patient's queue is now being called
   */
  async sendQueueCalledNotification(patientId: string, queue: Queue, counterNumber: number): Promise<boolean> {
    try {
      // Get both line_id and line_user_id for debugging
      const { data, error } = await supabase
        .from('patients')
        .select('line_id, line_user_id')  // Select both fields
        .eq('id', patientId)
        .single();
      
      if (error) {
        console.error('Error fetching patient LINE information:', error);
        return false;
      }

      // Log both values for debugging
      console.log('Patient data:', data);
      console.log('line_id:', data.line_id);
      console.log('line_user_id:', data.line_user_id);
      
      // Use line_user_id if available (the one that starts with 'U')
      // If not available, fall back to line_id (but this will likely fail)
      const lineUserId = data.line_user_id || data.line_id;
      
      // Check if we have any LINE ID to send to
      if (!lineUserId) {
        console.error('No LINE user ID found for patient');
        return false;
      }
      
      // Validate LINE user ID format (should start with 'U')
      if (!lineUserId.startsWith('U')) {
        console.warn('LINE user ID does not start with U:', lineUserId);
      }
      
      console.log(`Sending queue called notification to LINE user ID: ${lineUserId}`);
      
      const response = await axios.post('/api/line-send-notification', {
        lineUserId,  // This will be the correct line_user_id value
        message: `แจ้งเตือน: คิวหมายเลข ${queue.number} ถึงคิวของคุณแล้ว กรุณามาที่ช่องบริการ ${counterNumber}`,
        queueId: queue.id
      });
      
      return response.status === 200;
    } catch (error) {
      console.error('Error sending LINE notification:', error);
      return false;
    }
  }

  /**
   * Creates a formatted message for queue notifications
   */
  private createQueueNotificationMessage(queue: Queue, estimatedWaitTime: number): string {
    const waitTimeText = estimatedWaitTime <= 5 
      ? 'ประมาณ 5 นาที' 
      : `ประมาณ ${estimatedWaitTime} นาที`;
    
    return `🔔 แจ้งเตือนคิวของคุณ 🔔\n\n` +
      `คิวหมายเลข ${queue.number} ของคุณกำลังจะถูกเรียกในอีก${waitTimeText}\n\n` +
      `กรุณาเตรียมตัวและอยู่ในบริเวณที่สามารถได้ยินการเรียกคิว\n\n` +
      `หากคุณไม่อยู่ในสถานที่ กรุณากดปุ่ม "ขอเวลา" ในแอปพลิเคชัน`;
  }
}

export const lineNotificationService = new LineNotificationService();