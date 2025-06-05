
import * as React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Queue, QueueStatus } from '@/integrations/supabase/schema';
import { toast } from 'sonner';

export const useQueueStatusUpdates = (
  updateQueueInState: (updatedQueue: Queue) => void
) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const updateQueueStatus = React.useCallback(async (
    queueId: string, 
    newStatus: QueueStatus
  ): Promise<Queue | null> => {
    try {
      setLoading(true);
      setError(null);
      
      // Create a timestamp for status change
      const now = new Date().toISOString();
      
      // Prepare the update data based on the new status
      const updateData: Record<string, any> = { status: newStatus };
      
      if (newStatus === 'ACTIVE') {
        updateData.called_at = now; 
      } else if (newStatus === 'COMPLETED') {
        updateData.completed_at = now;
      } else if (newStatus === 'SKIPPED') {
        updateData.skipped_at = now;
      } else if (newStatus === 'CANCELLED') {
        updateData.cancelled_at = now;
      }
      
      // Update the queue in the database
      const { data, error } = await supabase
        .from('queues')
        .update(updateData)
        .eq('id', queueId)
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      if (!data) {
        throw new Error('No queue found with that ID');
      }
      
      // Cast the returned data to our Queue type
      const updatedQueue: Queue = {
        ...data,
        type: data.type as Queue['type'],
        status: data.status as QueueStatus
      };
      
      // Update the queue in local state
      updateQueueInState(updatedQueue);
      
      // Show a success message
      const statusMessages = {
        'ACTIVE': 'เรียกคิวแล้ว',
        'WAITING': 'กลับไปรอการเรียก',
        'COMPLETED': 'เสร็จสิ้นการให้บริการ',
        'SKIPPED': 'ข้ามคิวแล้ว',
        'CANCELLED': 'ยกเลิกคิวแล้ว'
      };
      
      toast.success(`คิวหมายเลข ${data.number} ${statusMessages[newStatus]}`);
      
      return updatedQueue;
    } catch (err: any) {
      console.error('Error updating queue status:', err);
      setError(err.message || 'Failed to update queue status');
      toast.error('ไม่สามารถอัปเดตสถานะคิวได้');
      return null;
    } finally {
      setLoading(false);
    }
  }, [updateQueueInState]);

  return {
    updateQueueStatus,
    loading,
    error
  };
};
