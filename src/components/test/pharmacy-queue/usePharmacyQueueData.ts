
import { useCallback } from 'react';
import { useQueues } from '@/hooks/useQueues';
import { usePatients } from '@/hooks/usePatients';
import { useServicePoints } from '@/hooks/useServicePoints';
import { createLogger } from '@/utils/logger';
import { toast } from 'sonner';
import { useQueueFiltering } from './hooks/useQueueFiltering';
import { usePatientData } from './hooks/usePatientData';
import { useQueueActions } from './hooks/useQueueActions';

const logger = createLogger('usePharmacyQueueData');

interface UsePharmacyQueueDataProps {
  servicePointId: string;
  refreshTrigger?: number;
}

export const usePharmacyQueueData = ({ servicePointId, refreshTrigger = 0 }: UsePharmacyQueueDataProps) => {
  const { 
    queues = [], 
    updateQueueStatus, 
    callQueue, 
    recallQueue,
    fetchQueues,
    removeQueue,
    transferQueueToServicePoint: baseTransferQueue,
    returnSkippedQueueToWaiting: baseReturnQueue,
    loading: globalLoading
  } = useQueues();
  
  const { patients = [] } = usePatients();
  const { servicePoints = [] } = useServicePoints();

  // More flexible filtering for pharmacy interface
  const servicePointQueues = Array.isArray(queues) ? queues.filter(queue => {
    // If "ALL" is selected (empty servicePointId), show all queues
    if (!servicePointId) {
      // Include all relevant statuses for pharmacy interface
      const isRelevantStatus = ['WAITING', 'ACTIVE', 'COMPLETED', 'SKIPPED'].includes(queue.status);
      
      // More flexible date filtering - include last 3 days
      const today = new Date();
      const threeDaysAgo = new Date(today);
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      const queueDate = new Date(queue.queue_date + 'T00:00:00');
      const isRecentQueue = queueDate >= threeDaysAgo;
      
      console.log('Pharmacy Queue filtering (ALL):', {
        queueId: queue.id,
        queueNumber: queue.number,
        status: queue.status,
        isRelevantStatus,
        queueDate: queue.queue_date,
        todayDate: today.toISOString().slice(0, 10),
        threeDaysAgoDate: threeDaysAgo.toISOString().slice(0, 10),
        isRecentQueue,
        willInclude: isRelevantStatus && isRecentQueue
      });
      
      return isRelevantStatus && isRecentQueue;
    }

    // For specific service point selection
    const isServicePointMatch = queue.service_point_id === servicePointId || 
                               (!queue.service_point_id && servicePointId);
    
    // Include all relevant statuses for pharmacy interface
    const isRelevantStatus = ['WAITING', 'ACTIVE', 'COMPLETED', 'SKIPPED'].includes(queue.status);
    
    // More flexible date filtering - include last 3 days
    const today = new Date();
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    const queueDate = new Date(queue.queue_date + 'T00:00:00');
    const isRecentQueue = queueDate >= threeDaysAgo;
    
    console.log('Pharmacy Queue filtering (specific):', {
      queueId: queue.id,
      queueNumber: queue.number,
      queueServicePointId: queue.service_point_id,
      targetServicePointId: servicePointId,
      isServicePointMatch,
      status: queue.status,
      isRelevantStatus,
      queueDate: queue.queue_date,
      todayDate: today.toISOString().slice(0, 10),
      threeDaysAgoDate: threeDaysAgo.toISOString().slice(0, 10),
      isRecentQueue,
      willInclude: isServicePointMatch && isRelevantStatus && isRecentQueue
    });
    
    return isServicePointMatch && isRelevantStatus && isRecentQueue;
  }) : [];

  console.log('Filtered pharmacy servicePointQueues:', servicePointQueues.length, servicePointQueues);

  const selectedServicePoint = servicePointId ? servicePoints.find(sp => sp.id === servicePointId) || null : null;

  // Group queues by status for the pharmacy interface
  const queuesByStatus = {
    waiting: servicePointQueues.filter(q => q.status === 'WAITING' && !q.paused_at),
    active: servicePointQueues.filter(q => q.status === 'ACTIVE'),
    completed: servicePointQueues.filter(q => q.status === 'COMPLETED'),
    skipped: servicePointQueues.filter(q => q.status === 'SKIPPED'),
    paused: servicePointQueues.filter(q => q.status === 'WAITING' && q.paused_at)
  };

  console.log('Pharmacy queues by status:', queuesByStatus);

  // Use patient data hook with safe defaults
  const { getPatientName, getPatientData } = usePatientData({ 
    patients: Array.isArray(patients) ? patients : [] 
  });

  // Create wrapper functions that match the expected signatures
  const wrappedTransferQueue = useCallback(async (queueId: string, targetServicePointId: string): Promise<void> => {
    if (!selectedServicePoint) return;
    
    try {
      await baseTransferQueue(queueId, selectedServicePoint.id, targetServicePointId);
    } catch (error) {
      logger.error('Error in transfer queue wrapper:', error);
      throw error;
    }
  }, [baseTransferQueue, selectedServicePoint]);

  const wrappedReturnQueue = useCallback(async (queueId: string): Promise<void> => {
    try {
      await baseReturnQueue(queueId);
    } catch (error) {
      logger.error('Error in return queue wrapper:', error);
      throw error;
    }
  }, [baseReturnQueue]);

  const wrappedRemoveQueue = useCallback(async (queueId: string): Promise<void> => {
    try {
      await removeQueue(queueId);
    } catch (error) {
      logger.error('Error in remove queue wrapper:', error);
      throw error;
    }
  }, [removeQueue]);

  // Use queue actions hook with safe defaults
  const {
    handleCallQueue,
    handleUpdateStatus,
    handleRecallQueue,
    handleHoldQueue,
    handleTransferQueue,
    handleReturnToWaiting,
    handleCancelQueue
  } = useQueueActions({
    selectedServicePoint,
    servicePointQueues: Array.isArray(servicePointQueues) ? servicePointQueues : [],
    servicePoints: Array.isArray(servicePoints) ? servicePoints : [],
    callQueue,
    updateQueueStatus,
    recallQueue,
    transferQueueToServicePoint: wrappedTransferQueue,
    returnSkippedQueueToWaiting: wrappedReturnQueue,
    removeQueue: wrappedRemoveQueue
  });

  // Simple manual refresh function
  const handleManualRefresh = useCallback(async () => {
    logger.debug(`Manual refresh requested for service point ${selectedServicePoint?.code || 'ALL'}`);
    try {
      await fetchQueues(true);
      toast.success('รีเฟรชข้อมูลเรียบร้อยแล้ว');
    } catch (error) {
      logger.error(`Error refreshing data:`, error);
      toast.error('ไม่สามารถรีเฟรชข้อมูลได้');
    }
  }, [fetchQueues, selectedServicePoint]);

  return {
    selectedServicePoint,
    queuesByStatus,
    getPatientName,
    getPatientData,
    handleCallQueue,
    handleUpdateStatus,
    handleRecallQueue,
    handleHoldQueue,
    handleTransferQueue,
    handleReturnToWaiting,
    handleCancelQueue,
    handleManualRefresh,
    isLoading: globalLoading,
    servicePoints: Array.isArray(servicePoints) ? servicePoints : []
  };
};
