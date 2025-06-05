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

  // More inclusive filtering - show queues for the specific service point OR unassigned queues
  const servicePointQueues = Array.isArray(queues) ? queues.filter(queue => {
    // Check if queue belongs to this service point OR is unassigned (null service_point_id)
    const isServicePointMatch = queue.service_point_id === servicePointId || 
                               (!queue.service_point_id && servicePointId);
    
    // Include all relevant statuses for pharmacy interface
    const isRelevantStatus = ['WAITING', 'ACTIVE', 'COMPLETED', 'SKIPPED'].includes(queue.status);
    
    // More flexible date filtering - include today and recent dates
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const queueDate = queue.queue_date;
    const todayStr = today.toISOString().slice(0, 10);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);
    
    const isRecentQueue = queueDate === todayStr || queueDate === yesterdayStr;
    
    console.log('Pharmacy Queue filtering:', {
      queueId: queue.id,
      queueNumber: queue.number,
      queueServicePointId: queue.service_point_id,
      targetServicePointId: servicePointId,
      isServicePointMatch,
      status: queue.status,
      isRelevantStatus,
      queueDate: queue.queue_date,
      todayDate: todayStr,
      yesterdayDate: yesterdayStr,
      isRecentQueue,
      willInclude: isServicePointMatch && isRelevantStatus && isRecentQueue
    });
    
    return isServicePointMatch && isRelevantStatus && isRecentQueue;
  }) : [];

  console.log('Filtered pharmacy servicePointQueues:', servicePointQueues.length, servicePointQueues);

  const selectedServicePoint = servicePoints.find(sp => sp.id === servicePointId) || null;

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
    logger.debug(`Manual refresh requested for service point ${selectedServicePoint?.code}`);
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
