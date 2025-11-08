
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useQueueClearance');

export const useQueueClearance = () => {
  const clearTestQueues = async () => {
    try {
      logger.info('Clearing test queues...');
      toast.info('กำลังลบคิวทดสอบ...');

      const today = new Date().toISOString().split('T')[0];

      // First, check if there are any simulation queues to delete
      const { data: simulationQueues, error: checkError } = await supabase
        .from('queues')
        .select('id')
        .like('notes', '%ข้อมูลจำลองโรงพยาบาล%')
        .eq('queue_date', today);

      if (checkError) {
        logger.error('Error checking for simulation queues:', checkError);
        throw new Error(`Database error: ${checkError.message}`);
      }

      if (!simulationQueues || simulationQueues.length === 0) {
        logger.info('No simulation queues found to delete');
        toast.info('ไม่พบคิวจำลองที่จะลบ');
        return 0;
      }

      logger.info(`Found ${simulationQueues.length} simulation queues to delete`);

      // Delete the simulation queues
      const { error: deleteError } = await supabase
        .from('queues')
        .delete()
        .like('notes', '%ข้อมูลจำลองโรงพยาบาล%')
        .eq('queue_date', today);

      if (deleteError) {
        logger.error('Error deleting simulation queues:', deleteError);
        throw new Error(`Database error: ${deleteError.message}`);
      }

      logger.info(`Successfully deleted ${simulationQueues.length} simulation queues`);
      toast.success(`ลบคิวจำลองเรียบร้อยแล้ว (${simulationQueues.length} คิว)`);

      return simulationQueues.length;

    } catch (error) {
      logger.error('Error clearing test queues:', error);
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
      toast.error(`เกิดข้อผิดพลาดในการลบคิวทดสอบ: ${errorMessage}`);
      throw error;
    }
  };

  const clearAllTodayQueues = async () => {
    try {
      logger.info('Clearing all today queues...');
      toast.info('กำลังลบคิววันนี้ทั้งหมด...');

      const today = new Date().toISOString().split('T')[0];

      // Get count of all queues for today
      const { data: todayQueues, error: checkError } = await supabase
        .from('queues')
        .select('id')
        .eq('queue_date', today);

      if (checkError) {
        logger.error('Error checking for today queues:', checkError);
        throw new Error(`Database error: ${checkError.message}`);
      }

      if (!todayQueues || todayQueues.length === 0) {
        logger.info('No queues found for today');
        toast.info('ไม่พบคิววันนี้ที่จะลบ');
        return 0;
      }

      logger.info(`Found ${todayQueues.length} queues for today to delete`);

      // Delete all queues for today
      const { error: deleteError } = await supabase
        .from('queues')
        .delete()
        .eq('queue_date', today);

      if (deleteError) {
        logger.error('Error deleting today queues:', deleteError);
        throw new Error(`Database error: ${deleteError.message}`);
      }

      logger.info(`Successfully deleted ${todayQueues.length} queues for today`);
      toast.success(`ลบคิววันนี้ทั้งหมดเรียบร้อยแล้ว (${todayQueues.length} คิว)`);

      return todayQueues.length;

    } catch (error) {
      logger.error('Error clearing all today queues:', error);
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
      toast.error(`เกิดข้อผิดพลาดในการลบคิววันนี้: ${errorMessage}`);
      throw error;
    }
  };

  return { clearTestQueues, clearAllTodayQueues };
};
