
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useQueueCreation');

export const useQueueCreation = () => {
  const createTestQueues = (
    count: number,
    enabledQueueTypes: any[],
    patients: any[],
    queueNumbers: Record<string, number>,
    findServicePointForQueueType: (queueType: any) => any
  ) => {
    const newQueues = [];
    const currentQueueNumbers = { ...queueNumbers };

    for (let i = 0; i < count; i++) {
      // Distribute queue types evenly among enabled types
      const queueType = enabledQueueTypes[i % enabledQueueTypes.length];
      // Use random patient selection to avoid duplicates
      const patient = patients[Math.floor(Math.random() * patients.length)];
      const assignedServicePoint = findServicePointForQueueType(queueType);

      const queueData = {
        patient_id: patient.id,
        type: queueType.code,
        number: currentQueueNumbers[queueType.code]++,
        status: 'WAITING',
        queue_date: new Date().toISOString().split('T')[0],
        service_point_id: assignedServicePoint?.id || null,
        notes: `คิวทดสอบ #${i + 1} - สร้างโดยระบบ${assignedServicePoint ? ` (${assignedServicePoint.name})` : ''}`
      };

      newQueues.push(queueData);
      logger.debug(`Created queue data with service point:`, queueData);
    }

    return newQueues;
  };

  const insertQueues = async (newQueues: any[]) => {
    const { data, error } = await supabase
      .from('queues')
      .insert(newQueues)
      .select();

    if (error) {
      logger.error('Database error inserting queues:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    if (!data || data.length === 0) {
      logger.warn('No queues were created');
      toast.warning('ไม่มีคิวที่ถูกสร้าง');
      return null;
    }

    const assignedCount = data.filter(q => q.service_point_id).length;
    const unassignedCount = data.length - assignedCount;

    logger.info(`Successfully created ${data.length} simulation queues (${assignedCount} assigned, ${unassignedCount} unassigned)`);
    toast.success(`สร้างคิวทดสอบเรียบร้อย ${data.length} คิว (มอบหมายแล้ว ${assignedCount} คิว)`);

    if (unassignedCount > 0) {
      toast.info(`มีคิวที่ยังไม่ได้มอบหมายจุดบริการ ${unassignedCount} คิว - ใช้การคำนวณใหม่เพื่อมอบหมาย`);
    }

    return data;
  };

  return { createTestQueues, insertQueues };
};
