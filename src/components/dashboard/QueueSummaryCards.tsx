
import React from 'react';
import { Queue } from '@/integrations/supabase/schema';
import QueueStats from '../queue/QueueStats';

interface QueueSummaryCardsProps {
  waitingQueues: Queue[];
  activeQueues: Queue[];
  completedQueues: Queue[];
  queues: Queue[];
  avgWaitTime?: number;
  avgServiceTime?: number;
}

const QueueSummaryCards: React.FC<QueueSummaryCardsProps> = ({ 
  waitingQueues, 
  activeQueues, 
  completedQueues, 
  queues,
  avgWaitTime,
  avgServiceTime
}) => {
  // Calculate predicted wait time based on number of waiting queues and average service time
  const predictedWaitTime = avgServiceTime 
    ? Math.round((waitingQueues.length * avgServiceTime) / Math.max(activeQueues.length, 1))
    : undefined;
  
  // Get unique patient IDs to count total patients
  const uniquePatientIds = new Set(queues.map(queue => queue.patient_id));
  const totalPatients = uniquePatientIds.size;
  
  return (
    <div className="mb-6">
      <QueueStats 
        totalQueues={completedQueues.length}
        totalPatients={totalPatients}
        avgWaitingTime={avgWaitTime}
        avgServiceTime={avgServiceTime}
        predictedWaitTime={predictedWaitTime}
        queueDistribution={{
          regular: waitingQueues.filter(q => q.type === 'GENERAL').length,
          urgent: waitingQueues.filter(q => q.type === 'PRIORITY').length,
          elderly: waitingQueues.filter(q => q.type === 'ELDERLY').length,
          special: waitingQueues.filter(q => q.type === 'FOLLOW_UP').length,
        }}
      />
    </div>
  );
};

export default QueueSummaryCards;
