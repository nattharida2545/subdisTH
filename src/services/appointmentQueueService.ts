
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const appointmentQueueService = {
  /**
   * Create queue entries for today's appointments
   */
  async createQueuesFromAppointments(): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('create_queues_from_appointments');
      
      if (error) {
        console.error('Error creating queues from appointments:', error);
        toast.error('เกิดข้อผิดพลาดในการสร้างคิวจากการนัดหมาย');
        return 0;
      }
      
      const queuesCreated = data || 0;
      
      if (queuesCreated > 0) {
        toast.success(`สร้างคิวจากการนัดหมายเรียบร้อย ${queuesCreated} คิว`);
      }
      
      return queuesCreated;
    } catch (error) {
      console.error('Error in createQueuesFromAppointments:', error);
      toast.error('เกิดข้อผิดพลาดในการสร้างคิวจากการนัดหมาย');
      return 0;
    }
  },

  /**
   * Sync appointment and queue statuses
   */
  async syncAppointmentQueueStatus(): Promise<void> {
    try {
      const { error } = await supabase.rpc('sync_appointment_queue_status');
      
      if (error) {
        console.error('Error syncing appointment queue status:', error);
        toast.error('เกิดข้อผิดพลาดในการซิงค์สถานะนัดหมายและคิว');
        return;
      }
      
      console.log('Appointment and queue status synced successfully');
    } catch (error) {
      console.error('Error in syncAppointmentQueueStatus:', error);
      toast.error('เกิดข้อผิดพลาดในการซิงค์สถานะนัดหมายและคิว');
    }
  },

  /**
   * Get appointment details for a queue
   */
  async getAppointmentByQueueId(queueId: string) {
    try {
      const { data, error } = await supabase
        .from('queues')
        .select(`
          appointment_id,
          appointments (
            id,
            date,
            purpose,
            notes,
            status
          )
        `)
        .eq('id', queueId)
        .single();
      
      if (error) {
        console.error('Error fetching appointment for queue:', error);
        return null;
      }
      
      return data?.appointments;
    } catch (error) {
      console.error('Error in getAppointmentByQueueId:', error);
      return null;
    }
  }
};
