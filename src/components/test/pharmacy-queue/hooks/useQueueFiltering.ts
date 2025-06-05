
import { useMemo } from 'react';
import { Queue, ServicePoint, QueueStatus } from '@/integrations/supabase/schema';

interface UseQueueFilteringProps {
  queues: Queue[];
  servicePointId: string;
  servicePoints: ServicePoint[];
}

// Define the UI status mapping to match what the PharmacyQueueTabs expects
interface QueuesByUIStatus {
  waiting: Queue[];
  active: Queue[];
  paused: Queue[];
  skipped: Queue[];
  completed: Queue[];
}

export const useQueueFiltering = ({ queues, servicePointId, servicePoints }: UseQueueFilteringProps) => {
  // Ensure we have safe arrays to work with
  const safeQueues = Array.isArray(queues) ? queues : [];
  const safeServicePoints = Array.isArray(servicePoints) ? servicePoints : [];

  const selectedServicePoint = useMemo(() => {
    return safeServicePoints.find(sp => sp.id === servicePointId) || null;
  }, [safeServicePoints, servicePointId]);

  const servicePointQueues = useMemo(() => {
    if (!selectedServicePoint) return [];
    
    return safeQueues.filter(queue => {
      // Filter by service point or show all if no specific service point assigned
      const matchesServicePoint = !queue.service_point_id || queue.service_point_id === selectedServicePoint.id;
      // Only show active queues for pharmacy
      const isActive = queue.status === 'ACTIVE';
      
      return matchesServicePoint && isActive;
    });
  }, [safeQueues, selectedServicePoint]);

  const queuesByStatus = useMemo((): QueuesByUIStatus => {
    if (!Array.isArray(servicePointQueues)) {
      return {
        waiting: [],
        active: [],
        paused: [],
        skipped: [],
        completed: []
      };
    }
    
    const grouped: QueuesByUIStatus = {
      waiting: [],
      active: [],
      paused: [],
      skipped: [],
      completed: []
    };

    servicePointQueues.forEach(queue => {
      if (!queue || !queue.status) return;
      
      // Map database status to UI status
      switch (queue.status as QueueStatus) {
        case 'WAITING':
          grouped.waiting.push(queue);
          break;
        case 'ACTIVE':
          grouped.active.push(queue);
          break;
        case 'COMPLETED':
          grouped.completed.push(queue);
          break;
        case 'SKIPPED':
          grouped.skipped.push(queue);
          break;
        case 'ON_HOLD':
          grouped.paused.push(queue);
          break;
        case 'CANCELLED':
          // Don't show cancelled queues in any tab
          break;
        default:
          // For any unknown status, put in waiting
          grouped.waiting.push(queue);
          break;
      }
    });

    return grouped;
  }, [servicePointQueues]);

  return {
    selectedServicePoint,
    servicePointQueues: Array.isArray(servicePointQueues) ? servicePointQueues : [],
    queuesByStatus
  };
};
