
import React from 'react';
import { Queue, Patient, ServicePoint } from '@/integrations/supabase/schema';
import ActiveQueueSection from '@/components/queue/ActiveQueueSection';
import WaitingQueueSection from '@/components/queue/WaitingQueueSection';
import CompletedQueueSection from '@/components/queue/CompletedQueueSection';

interface QueueBoardContentProps {
  activeQueues: Queue[];
  waitingQueues: Queue[];
  completedQueues: Queue[];
  findPatient: (patientId: string) => Patient | undefined;
  findServicePoint: (servicePointId: string | null) => ServicePoint | null;
}

const QueueBoardContent: React.FC<QueueBoardContentProps> = ({
  activeQueues,
  waitingQueues,
  completedQueues,
  findPatient,
  findServicePoint
}) => {
  return (
    <main className="container mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <ActiveQueueSection 
          activeQueues={activeQueues}
          findPatient={findPatient}
          findServicePoint={findServicePoint}
        />
        
        <WaitingQueueSection 
          waitingQueues={waitingQueues}
          findPatient={findPatient}
        />
        
        <CompletedQueueSection 
          completedQueues={completedQueues}
          findPatient={findPatient}
        />
      </div>
    </main>
  );
};

export default QueueBoardContent;
