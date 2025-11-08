
import React, { useState, useEffect } from 'react';
import { useQueues } from '@/hooks/useQueues';
import { usePatients } from '@/hooks/usePatients';
import { useServicePoints } from '@/hooks/useServicePoints';
import { QueueStatus, Patient } from '@/integrations/supabase/schema';
import QueueBoardContent from './QueueBoardContent';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { createLogger } from '@/utils/logger';
import { isCompletedToday } from '@/utils/dateUtils';

const logger = createLogger('QueueBoard');

// Define queue status constants to use as values
const QUEUE_STATUS = {
  ACTIVE: 'ACTIVE' as QueueStatus,
  WAITING: 'WAITING' as QueueStatus,
  COMPLETED: 'COMPLETED' as QueueStatus,
  SKIPPED: 'SKIPPED' as QueueStatus
};

const QueueBoardContainer = () => {
  logger.debug('Rendering QueueBoardContainer');
  
  // Fetch data from Supabase
  const { getQueuesByStatus, sortQueues } = useQueues();
  const { patients } = usePatients();
  const { servicePoints } = useServicePoints();
  const [activeQueues, setActiveQueues] = useState([]);
  const [waitingQueues, setWaitingQueues] = useState([]);
  const [completedQueues, setCompletedQueues] = useState([]);
  
  // Fetch queues data and set up real-time subscription
  useEffect(() => {
    const fetchQueues = async () => {
      try {
        const active = await getQueuesByStatus(QUEUE_STATUS.ACTIVE);
        setActiveQueues(active);
        
        const waiting = await getQueuesByStatus(QUEUE_STATUS.WAITING);
        // Apply sorting algorithm to waiting queues
        const sortedWaiting = sortQueues(waiting);
        setWaitingQueues(sortedWaiting.slice(0, 5));
        
        const completed = await getQueuesByStatus(QUEUE_STATUS.COMPLETED);
        // Filter completed queues to only show today's queues
        const todayCompleted = completed.filter(queue => 
          isCompletedToday(queue.completed_at, queue.queue_date)
        );
        setCompletedQueues(todayCompleted.sort((a, b) => 
          new Date(b.completed_at || b.updated_at).getTime() - 
          new Date(a.completed_at || a.updated_at).getTime()).slice(0, 5));
          
        logger.info(`Fetched queues - Active: ${active.length}, Waiting: ${waiting.length}, Completed today: ${todayCompleted.length}`);
      } catch (error) {
        logger.error('Error fetching queues:', error);
        toast.error('ไม่สามารถดึงข้อมูลคิวได้');
      }
    };
    
    fetchQueues();
    
    // Set up real-time subscription for queues
    const channel = supabase
      .channel('queue-changes')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'queues' },
          (payload) => {
            logger.debug('Queue change detected:', payload);
            fetchQueues(); // Refresh data when changes occur
          }
      )
      .subscribe();
    
    // Refresh data every 30 seconds as a fallback
    const refreshTimer = setInterval(fetchQueues, 30000);
    
    return () => {
      clearInterval(refreshTimer);
      supabase.removeChannel(channel);
    };
  }, [getQueuesByStatus, sortQueues]);

  // Find patient by ID
  const findPatient = (patientId: string): Patient | undefined => {
    return patients.find(p => p.id === patientId);
  };

  // Find service point by ID
  const findServicePoint = (servicePointId: string | null) => {
    if (!servicePointId) return null;
    return servicePoints.find(sp => sp.id === servicePointId);
  };
  
  return (
    <QueueBoardContent 
      activeQueues={activeQueues}
      waitingQueues={waitingQueues}
      completedQueues={completedQueues}
      findPatient={findPatient}
      findServicePoint={findServicePoint}
    />
  );
};

export default QueueBoardContainer;
