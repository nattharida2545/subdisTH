
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import QueueCard from '@/components/queue/QueueCard';

interface PharmacyQueueTabContentProps {
  value: string;
  queues: any[];
  emptyMessage: string;
  getPatientName: (patientId: string) => string;
  onViewPatientInfo: (queue: any) => void;
  onCallQueue?: (queueId: string) => void;
  onUpdateStatus?: (queueId: string, status: string) => void;
  onRecallQueue?: (queueId: string) => void;
  onHoldQueue?: (queueId: string) => void;
  onTransferClick?: (queueId: string) => void;
  onReturnToWaiting?: (queueId: string) => void;
  onCancelQueue?: (queueId: string) => void;
  isCompleted?: boolean;
}

const PharmacyQueueTabContent: React.FC<PharmacyQueueTabContentProps> = ({
  value,
  queues,
  emptyMessage,
  getPatientName,
  onViewPatientInfo,
  onCallQueue,
  onUpdateStatus,
  onRecallQueue,
  onHoldQueue,
  onTransferClick,
  onReturnToWaiting,
  onCancelQueue,
  isCompleted = false
}) => {
  const displayQueues = isCompleted ? queues.slice(0, 10) : queues;

  return (
    <TabsContent value={value} className="space-y-2">
      {queues.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {emptyMessage}
        </div>
      ) : (
        displayQueues.map((queue) => (
          <QueueCard
            key={queue.id}
            queue={queue}
            patientName={getPatientName(queue.patient_id)}
            onCall={onCallQueue ? () => onCallQueue(queue.id) : undefined}
            onSkip={onUpdateStatus ? () => onUpdateStatus(queue.id, 'SKIPPED') : undefined}
            onCancel={onCancelQueue ? () => onCancelQueue(queue.id) : undefined}
            onComplete={onUpdateStatus ? () => onUpdateStatus(queue.id, 'COMPLETED') : undefined}
            onRecall={onRecallQueue ? () => onRecallQueue(queue.id) : undefined}
            onHold={onHoldQueue ? () => onHoldQueue(queue.id) : undefined}
            onTransfer={onTransferClick ? () => onTransferClick(queue.id) : undefined}
            onReturnToWaiting={onReturnToWaiting ? () => onReturnToWaiting(queue.id) : undefined}
            onViewPatientInfo={() => onViewPatientInfo(queue)}
            isPharmacyInterface={true}
          />
        ))
      )}
    </TabsContent>
  );
};

export default PharmacyQueueTabContent;
