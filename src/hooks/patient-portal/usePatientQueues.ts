
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Patient, Queue, QueueStatus } from '@/integrations/supabase/schema';

interface UsePatientQueuesProps {
  patients: Patient[];
}

export const usePatientQueues = ({ patients }: UsePatientQueuesProps) => {
  const [patientQueues, setPatientQueues] = useState<Record<string, Queue[]>>({});
  const [loading, setLoading] = useState(true);
  const [cancellingQueue, setCancellingQueue] = useState<string | null>(null);

  const fetchQueuesForPatients = async () => {
    try {
      setLoading(true);
      
      if (patients.length === 0) {
        setLoading(false);
        return;
      }
      
      const patientIds = patients.map(p => p.id);
      
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      
      const { data: queueData, error } = await supabase
        .from('queues')
        .select('*')
        .in('patient_id', patientIds)
        .in('status', ['WAITING', 'ACTIVE'])
        .eq('queue_date', today)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Group queues by patient ID
      const queuesByPatient: Record<string, Queue[]> = {};
      patientIds.forEach(id => {
        queuesByPatient[id] = [];
      });
      
      if (queueData) {
        queueData.forEach(queue => {
          if (queuesByPatient[queue.patient_id]) {
            queuesByPatient[queue.patient_id].push(queue as Queue);
          }
        });
      }
      
      setPatientQueues(queuesByPatient);
    } catch (error) {
      console.error('Error fetching patient queues:', error);
      toast.error('เกิดข้อผิดพลาดในการดึงข้อมูลคิว');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelQueue = async (queueId: string) => {
    try {
      setCancellingQueue(queueId);
      
      const { error } = await supabase
        .from('queues')
        .update({ 
          status: 'CANCELLED' as QueueStatus,
          cancelled_at: new Date().toISOString()
        })
        .eq('id', queueId);
      
      if (error) throw error;
      
      toast.success('ยกเลิกคิวเรียบร้อยแล้ว');
      
      // Refresh queues after cancellation
      await fetchQueuesForPatients();
    } catch (error) {
      console.error('Error cancelling queue:', error);
      toast.error('เกิดข้อผิดพลาดในการยกเลิกคิว');
    } finally {
      setCancellingQueue(null);
    }
  };

  useEffect(() => {
    fetchQueuesForPatients();
  }, [patients]);

  return {
    patientQueues,
    loading,
    cancellingQueue,
    handleCancelQueue,
    refreshQueues: fetchQueuesForPatients
  };
};
