import React from 'react';
import { QueueIns, ServicePointIns } from '@/integrations/supabase/schema';
import ActiveQueueInsSection from '@/components/ins-queue/board/ActiveQueueInsSection';
import WaitingQueueInsSection from '@/components/ins-queue/board/WaitingQueueInsSection';
import CompletedQueueInsSection from '@/components/ins-queue/board/CompletedQueueInsSection';

interface QueueInsBoardContentProps {
  activeQueues: QueueIns[];
  waitingQueues: QueueIns[];
  completedQueues: QueueIns[];
  findServicePoint: (servicePointId: string | null) => ServicePointIns | null;
}

const QueueInsBoardContent: React.FC<QueueInsBoardContentProps> = ({
  activeQueues,
  waitingQueues,
  completedQueues,
  findServicePoint
}) => {
  return (
    <main className="container mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <ActiveQueueInsSection 
          activeQueues={activeQueues}
          findServicePoint={findServicePoint}
        />
        
        <WaitingQueueInsSection 
          waitingQueues={waitingQueues}
        />
        
        <CompletedQueueInsSection 
          completedQueues={completedQueues}
        />
      </div>
    </main>
  );
};

export default QueueInsBoardContent;
