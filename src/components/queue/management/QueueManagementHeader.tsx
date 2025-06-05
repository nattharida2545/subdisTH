
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Calculator } from 'lucide-react';
import { useQueueRecalculation } from '@/hooks/queue/useQueueRecalculation';
import CancelAllQueuesButton from './CancelAllQueuesButton';

interface QueueManagementHeaderProps {
  waitingQueuesCount?: number;
  onCancelAllQueues?: () => Promise<void>;
  isCancellingAll?: boolean;
}

const QueueManagementHeader: React.FC<QueueManagementHeaderProps> = ({
  waitingQueuesCount = 0,
  onCancelAllQueues,
  isCancellingAll = false
}) => {
  const { recalculateAllQueues } = useQueueRecalculation();

  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold tracking-tight">การจัดการคิว</h1>
      
      <div className="flex items-center gap-2">
        {/* Cancel All Queues Button */}
        {onCancelAllQueues && (
          <CancelAllQueuesButton
            waitingQueuesCount={waitingQueuesCount}
            onCancelAll={onCancelAllQueues}
            isLoading={isCancellingAll}
          />
        )}

        <Button
          variant="outline"
          onClick={recalculateAllQueues}
          className="flex items-center gap-2"
        >
          <Calculator className="w-4 h-4" />
          คำนวณการมอบหมายคิวใหม่
        </Button>
      </div>
    </div>
  );
};

export default QueueManagementHeader;
