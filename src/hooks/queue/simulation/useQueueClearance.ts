
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

      // First, check if there are any test queues to delete
      const { data: testQueues, error: checkError } = await supabase
        .from('queues')
        .select('id')
        .or('notes.like.%คิวทดสอบ%,notes.like.%สร้างโดยระบบ%')
        .eq('queue_date', today);

      if (checkError) {
        logger.error('Error checking for test queues:', checkError);
        throw new Error(`Database error: ${checkError.message}`);
      }

      if (!testQueues || testQueues.length === 0) {
        logger.info('No test queues found to delete');
        toast.info('ไม่พบคิวทดสอบที่จะลบ');
        return;
      }

      logger.info(`Found ${testQueues.length} test queues to delete`);

      // Delete the test queues
      const { error: deleteError } = await supabase
        .from('queues')
        .delete()
        .or('notes.like.%คิวทดสอบ%,notes.like.%สร้างโดยระบบ%')
        .eq('queue_date', today);

      if (deleteError) {
        logger.error('Error deleting test queues:', deleteError);
        throw new Error(`Database error: ${deleteError.message}`);
      }

      logger.info(`Successfully deleted ${testQueues.length} test queues`);
      toast.success(`ลบคิวทดสอบเรียบร้อยแล้ว (${testQueues.length} คิว)`);

    } catch (error) {
      logger.error('Error clearing test queues:', error);
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
      toast.error(`เกิดข้อผิดพลาดในการลบคิวทดสอบ: ${errorMessage}`);
    }
  };

  return { clearTestQueues };
};
