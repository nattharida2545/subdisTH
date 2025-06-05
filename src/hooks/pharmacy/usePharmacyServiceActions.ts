
import * as React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { createLogger } from '@/utils/logger';
import { queueSupabaseRequest } from '@/utils/requestThrottler';
import { PharmacyQueue } from './types';
import { toast } from 'sonner';

const logger = createLogger('usePharmacyServiceActions');

interface UsePharmacyServiceActionsProps {
  activeQueue: PharmacyQueue | null;
  setActiveQueue: (queue: PharmacyQueue | null) => void;
  fetchPharmacyQueues: () => Promise<PharmacyQueue[]>;
}

export const usePharmacyServiceActions = ({
  activeQueue,
  setActiveQueue,
  fetchPharmacyQueues
}: UsePharmacyServiceActionsProps) => {
  const [error, setError] = React.useState<string | null>(null);

  // Complete pharmacy service - Define callbacks before any useEffects
  const completeService = React.useCallback(async (queueId: string, notes?: string) => {
    try {
      setError(null);
      logger.info(`Completing pharmacy service for queue ${queueId}`);

      if (!activeQueue || activeQueue.id !== queueId) {
        toast.error('ไม่พบข้อมูลคิวที่กำลังให้บริการ');
        return false;
      }

      const serviceId = activeQueue.service?.id;
      if (!serviceId) {
        toast.error('ไม่พบข้อมูลการให้บริการ');
        return false;
      }

      // Update the pharmacy service
      const serviceResult = await queueSupabaseRequest(async () => {
        return await supabase
          .from('pharmacy_queue_services')
          .update({
            status: 'COMPLETED', 
            service_end_at: new Date().toISOString(),
            pharmacist_notes: notes
          })
          .eq('id', serviceId)
          .select();
      });

      if (serviceResult.error) {
        throw serviceResult.error;
      }

      // Update the queue status
      const queueResult = await queueSupabaseRequest(async () => {
        return await supabase
          .from('queues')
          .update({ 
            status: 'COMPLETED',
            completed_at: new Date().toISOString(),
            pharmacy_status: 'COMPLETED'
          })
          .eq('id', queueId)
          .select();
      });

      if (queueResult.error) {
        throw queueResult.error;
      }

      setActiveQueue(null);
      await fetchPharmacyQueues(); // Refresh all queues
      
      toast.success('ให้บริการเสร็จสิ้น');
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete service';
      logger.error('Error completing pharmacy service:', err);
      setError(errorMessage);
      toast.error('ไม่สามารถบันทึกการให้บริการได้');
      return false;
    }
  }, [activeQueue, setActiveQueue, fetchPharmacyQueues]);

  // Forward to another service
  const forwardService = React.useCallback(async (queueId: string, forwardTo: string, notes?: string) => {
    try {
      setError(null);
      logger.info(`Forwarding queue ${queueId} to ${forwardTo}`);

      if (!activeQueue || activeQueue.id !== queueId) {
        toast.error('ไม่พบข้อมูลคิวที่กำลังให้บริการ');
        return false;
      }

      const serviceId = activeQueue.service?.id;
      if (!serviceId) {
        toast.error('ไม่พบข้อมูลการให้บริการ');
        return false;
      }

      // Update the pharmacy service
      const serviceResult = await queueSupabaseRequest(async () => {
        return await supabase
          .from('pharmacy_queue_services')
          .update({
            status: 'FORWARDED', 
            service_end_at: new Date().toISOString(),
            forwarded_to: forwardTo,
            pharmacist_notes: notes
          })
          .eq('id', serviceId)
          .select();
      });

      if (serviceResult.error) {
        throw serviceResult.error;
      }

      // Keep queue active but update pharmacy status
      const queueResult = await queueSupabaseRequest(async () => {
        return await supabase
          .from('queues')
          .update({ 
            pharmacy_status: 'FORWARDED'
          })
          .eq('id', queueId)
          .select();
      });

      if (queueResult.error) {
        throw queueResult.error;
      }

      setActiveQueue(null);
      await fetchPharmacyQueues(); // Refresh all queues
      
      toast.success(`ส่งต่อไปยัง ${forwardTo} เรียบร้อยแล้ว`);
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to forward service';
      logger.error('Error forwarding pharmacy service:', err);
      setError(errorMessage);
      toast.error('ไม่สามารถบันทึกการส่งต่อได้');
      return false;
    }
  }, [activeQueue, setActiveQueue, fetchPharmacyQueues]);

  return {
    error,
    completeService,
    forwardService
  };
};
