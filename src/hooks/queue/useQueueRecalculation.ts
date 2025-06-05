
import { useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQueues } from '@/hooks/useQueues';
import { useServicePointQueueTypes } from '@/hooks/useServicePointQueueTypes';
import { useServicePoints } from '@/hooks/useServicePoints';
import { useQueueTypes } from '@/hooks/useQueueTypes';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useQueueRecalculation');

export const useQueueRecalculation = () => {
  const { fetchQueues } = useQueues();
  const { mappings } = useServicePointQueueTypes();
  const { servicePoints } = useServicePoints();
  const { queueTypes } = useQueueTypes();

  const recalculateAllQueues = useCallback(async () => {
    try {
      logger.info('Starting queue recalculation...');
      toast.info('กำลังคำนวณการมอบหมายคิวใหม่...');

      const today = new Date().toISOString().split('T')[0];

      // Get all waiting queues for today (including unassigned ones)
      const { data: waitingQueues, error: queueError } = await supabase
        .from('queues')
        .select('*')
        .eq('status', 'WAITING')
        .eq('queue_date', today);

      if (queueError) {
        logger.error('Error fetching waiting queues:', queueError);
        throw new Error(`Database error: ${queueError.message}`);
      }

      if (!waitingQueues || waitingQueues.length === 0) {
        logger.info('No waiting queues found for recalculation');
        toast.info('ไม่มีคิวที่รอดำเนินการสำหรับการคำนวณใหม่');
        return;
      }

      // Filter enabled service points
      const enabledServicePoints = servicePoints.filter(sp => sp.enabled);
      if (enabledServicePoints.length === 0) {
        logger.warn('No enabled service points found');
        toast.warning('ไม่พบจุดบริการที่เปิดใช้งาน');
        return;
      }

      logger.info(`Found ${waitingQueues.length} waiting queues to process`);

      // Helper function to find best service point for a queue
      const findBestServicePointForQueue = async (queue: any) => {
        // Find queue type
        const queueType = queueTypes.find(qt => qt.code === queue.type);
        if (!queueType) {
          logger.warn(`Queue type not found for queue ${queue.id}: ${queue.type}`);
          return null;
        }

        // Find compatible service points for this queue type
        const compatibleServicePoints = mappings
          .filter(mapping => mapping.queue_type_id === queueType.id)
          .map(mapping => enabledServicePoints.find(sp => sp.id === mapping.service_point_id))
          .filter(Boolean);

        if (compatibleServicePoints.length === 0) {
          logger.warn(`No compatible service points found for queue type: ${queueType.code}`);
          // Fallback: use first available service point
          return enabledServicePoints[0];
        }

        // Find service point with least current queues
        let selectedServicePoint = compatibleServicePoints[0];
        let minQueueCount = Number.MAX_SAFE_INTEGER;
        
        for (const sp of compatibleServicePoints) {
          try {
            const { count } = await supabase
              .from('queues')
              .select('*', { count: 'exact', head: true })
              .eq('service_point_id', sp.id)
              .eq('status', 'WAITING')
              .eq('queue_date', today);

            const queueCount = count || 0;
            if (queueCount < minQueueCount) {
              minQueueCount = queueCount;
              selectedServicePoint = sp;
            }
          } catch (error) {
            logger.warn(`Error getting queue count for service point ${sp.id}:`, error);
          }
        }

        return selectedServicePoint;
      };

      // Process each queue for assignment/reassignment
      const updatePromises: Promise<any>[] = [];
      let assignedCount = 0;
      let reassignedCount = 0;
      
      for (const queue of waitingQueues) {
        try {
          const bestServicePoint = await findBestServicePointForQueue(queue);
          
          if (!bestServicePoint) {
            logger.warn(`Could not find suitable service point for queue ${queue.id}`);
            continue;
          }

          // Update queue if it needs assignment or reassignment
          const needsUpdate = !queue.service_point_id || queue.service_point_id !== bestServicePoint.id;
          
          if (needsUpdate) {
            const updatePromise = Promise.resolve(
              supabase
                .from('queues')
                .update({ service_point_id: bestServicePoint.id })
                .eq('id', queue.id)
            );
            
            updatePromises.push(updatePromise);
            
            if (!queue.service_point_id) {
              assignedCount++;
              logger.debug(`Assigning queue ${queue.id} to service point ${bestServicePoint.id}`);
            } else {
              reassignedCount++;
              logger.debug(`Reassigning queue ${queue.id} to service point ${bestServicePoint.id}`);
            }
          }
        } catch (error) {
          logger.warn(`Error processing queue ${queue.id}:`, error);
        }
      }

      // Execute all updates
      if (updatePromises.length > 0) {
        const results = await Promise.allSettled(updatePromises);
        
        // Check for any failed updates
        const failedUpdates = results.filter(result => result.status === 'rejected');
        if (failedUpdates.length > 0) {
          logger.warn(`${failedUpdates.length} queue updates failed`);
          failedUpdates.forEach((result, index) => {
            if (result.status === 'rejected') {
              logger.error(`Update ${index} failed:`, result.reason);
            }
          });
        }

        const successfulUpdates = results.filter(result => result.status === 'fulfilled').length;
        
        logger.info(`Successfully processed ${successfulUpdates} queue assignments (${assignedCount} new assignments, ${reassignedCount} reassignments)`);
        
        if (assignedCount > 0 || reassignedCount > 0) {
          toast.success(`คำนวณการมอบหมายคิวใหม่เรียบร้อย (มอบหมายใหม่ ${assignedCount} คิว, ปรับเปลี่ยน ${reassignedCount} คิว)`);
        } else {
          toast.info('การมอบหมายคิวทั้งหมดเหมาะสมแล้ว');
        }
        
        if (failedUpdates.length > 0) {
          toast.warning(`มีการอัปเดตบางรายการล้มเหลว (${failedUpdates.length} รายการ)`);
        }
      } else {
        logger.info('All queue assignments are already optimal');
        toast.info('การมอบหมายคิวทั้งหมดเหมาะสมแล้ว');
      }

      // Refresh queue data
      await fetchQueues();

    } catch (error) {
      logger.error('Error recalculating queues:', error);
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
      toast.error(`เกิดข้อผิดพลาดในการคำนวณคิวใหม่: ${errorMessage}`);
    }
  }, [mappings, servicePoints, queueTypes, fetchQueues]);

  return {
    recalculateAllQueues
  };
};
