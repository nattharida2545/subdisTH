
import * as React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { queueSupabaseRequest } from '@/utils/requestThrottler';
import { PharmacyQueue } from '../types';
import { QueueStatus, QueueTypeEnum } from '@/integrations/supabase/schema';
import { usePharmacyErrorHandler } from './usePharmacyErrorHandler';

export const usePharmacyDataFetch = () => {
  const { withErrorHandling } = usePharmacyErrorHandler();

  const transformQueueData = React.useCallback((rawData: any[]): PharmacyQueue[] => {
    return rawData.map(q => {
      // Safely transform service data
      const queueService = q.service && Array.isArray(q.service) && q.service.length > 0 ? {
        id: q.service[0].id || '',
        queue_id: q.service[0].queue_id || '',
        status: (q.service[0].status || 'IN_PROGRESS') as 'IN_PROGRESS' | 'COMPLETED' | 'FORWARDED',
        pharmacist_notes: q.service[0].pharmacist_notes || null,
        forwarded_to: q.service[0].forwarded_to || null,
        service_start_at: q.service[0].service_start_at || new Date().toISOString(),
        service_end_at: q.service[0].service_end_at || null,
        created_at: q.service[0].created_at || new Date().toISOString(),
        updated_at: q.service[0].updated_at || new Date().toISOString()
      } : undefined;
      
      // Transform queue data with proper type casting
      return {
        id: q.id || '',
        number: q.number || 0,
        patient_id: q.patient_id || '',
        type: q.type as string,
        status: q.status as string,
        notes: q.notes || undefined,
        created_at: q.created_at || new Date().toISOString(),
        updated_at: q.updated_at || new Date().toISOString(),
        called_at: q.called_at || undefined,
        completed_at: q.completed_at || undefined,
        queue_date: q.queue_date || undefined,
        patient: q.patient || undefined,
        service: queueService
      } as PharmacyQueue;
    });
  }, []);

  const fetchPharmacyQueues = React.useCallback(
    withErrorHandling(async (): Promise<PharmacyQueue[]> => {
      const todayDate = new Date().toISOString().slice(0, 10);
      
      const result = await queueSupabaseRequest(async () => {
        const response = await supabase
          .from('queues')
          .select(`
            *,
            patient:patients(*),
            service:pharmacy_queue_services(*)
          `)
          .eq('queue_date', todayDate)
          .in('status', ['WAITING', 'ACTIVE', 'COMPLETED'])
          .not('service_point_id', 'is', null)
          .order('created_at', { ascending: true });
        
        return response;
      });

      if (result.error) {
        throw result.error;
      }

      return transformQueueData(result.data || []);
    }, 'FETCH_ERROR', { operation: 'fetchPharmacyQueues' }),
    [transformQueueData, withErrorHandling]
  );

  const findActiveServiceQueue = React.useCallback((queueList: PharmacyQueue[]): PharmacyQueue | null => {
    return queueList.find(q => q.service && q.service.status === 'IN_PROGRESS') || null;
  }, []);

  return {
    fetchPharmacyQueues,
    findActiveServiceQueue,
    transformQueueData
  };
};
