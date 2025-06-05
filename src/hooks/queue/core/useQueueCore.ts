
import { useState, useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Queue, QueueStatus } from '@/integrations/supabase/schema';
import { toast } from 'sonner';
import { createLogger } from '@/utils/logger';
import { mapToQueueObject } from '@/utils/queue/queueMapping';

const logger = createLogger('useQueueCore');

export const useQueueCore = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  
  const { data: queues = [], isLoading: queryLoading } = useQuery({
    queryKey: ['queues'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('queues')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) {
        logger.error('Error fetching queues:', error);
        throw error;
      }
      
      return data ? data.map(mapToQueueObject) : [];
    },
    refetchInterval: 5000,
  });

  const fetchQueues = useCallback(async (force = false) => {
    setLoading(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ['queues'] });
      if (force) {
        await queryClient.refetchQueries({ queryKey: ['queues'] });
      }
    } catch (error) {
      logger.error('Error fetching queues:', error);
      setError('Failed to fetch queues');
    } finally {
      setLoading(false);
    }
  }, [queryClient]);

  const addQueue = useCallback(async (queueData: Partial<Queue>): Promise<Queue | null> => {
    try {
      // Ensure required fields are present
      const insertData = {
        patient_id: queueData.patient_id!,
        number: queueData.number!,
        type: queueData.type || 'GENERAL',
        status: queueData.status || 'WAITING',
        service_point_id: queueData.service_point_id,
        notes: queueData.notes,
        queue_date: queueData.queue_date || new Date().toISOString().split('T')[0]
      };

      const { data, error } = await supabase
        .from('queues')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        logger.error('Error adding queue:', error);
        toast.error('ไม่สามารถเพิ่มคิวได้');
        return null;
      }

      if (data) {
        const typedQueue = mapToQueueObject(data);
        await fetchQueues();
        toast.success('เพิ่มคิวเรียบร้อยแล้ว');
        return typedQueue;
      }

      return null;
    } catch (error) {
      logger.error('Error in addQueue:', error);
      toast.error('เกิดข้อผิดพลาดในการเพิ่มคิว');
      return null;
    }
  }, [fetchQueues]);

  const updateQueueStatus = useCallback(async (queueId: string, status: QueueStatus): Promise<Queue | null> => {
    try {
      const updateData: any = { status };
      
      // Add timestamp fields based on status
      if (status === 'ACTIVE') {
        updateData.called_at = new Date().toISOString();
      } else if (status === 'COMPLETED') {
        updateData.completed_at = new Date().toISOString();
      } else if (status === 'SKIPPED') {
        updateData.skipped_at = new Date().toISOString();
      } else if (status === 'CANCELLED') {
        updateData.cancelled_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('queues')
        .update(updateData)
        .eq('id', queueId)
        .select()
        .single();

      if (error) {
        logger.error('Error updating queue status:', error);
        toast.error('ไม่สามารถอัปเดตสถานะคิวได้');
        return null;
      }

      if (data) {
        const typedQueue = mapToQueueObject(data);
        await fetchQueues();
        return typedQueue;
      }

      return null;
    } catch (error) {
      logger.error('Error in updateQueueStatus:', error);
      toast.error('เกิดข้อผิดพลาดในการอัปเดตสถานะคิว');
      return null;
    }
  }, [fetchQueues]);

  const removeQueue = useCallback(async (queueId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('queues')
        .delete()
        .eq('id', queueId);

      if (error) {
        logger.error('Error removing queue:', error);
        toast.error('ไม่สามารถลบคิวได้');
        return false;
      }

      await fetchQueues();
      toast.success('ลบคิวเรียบร้อยแล้ว');
      return true;
    } catch (error) {
      logger.error('Error in removeQueue:', error);
      toast.error('เกิดข้อผิดพลาดในการลบคิว');
      return false;
    }
  }, [fetchQueues]);

  const updateQueueInState = useCallback((updatedQueue: Queue) => {
    queryClient.setQueryData(['queues'], (oldQueues: Queue[] = []) => {
      return oldQueues.map(queue => 
        queue.id === updatedQueue.id ? updatedQueue : queue
      );
    });
  }, [queryClient]);

  const getQueuesByStatus = useCallback((status: QueueStatus) => {
    return queues.filter(queue => queue.status === status);
  }, [queues]);

  useEffect(() => {
    if (queryLoading) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [queryLoading]);

  return {
    queues,
    loading: loading || queryLoading,
    error,
    fetchQueues,
    addQueue,
    updateQueueStatus,
    removeQueue,
    getQueuesByStatus,
    updateQueueInState
  };
};
