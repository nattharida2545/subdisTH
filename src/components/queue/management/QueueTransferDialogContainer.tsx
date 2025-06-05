
import * as React from 'react';
import { Queue, ServicePoint } from '@/integrations/supabase/schema';
import QueueTransferDialog from '@/components/test/pharmacy-queue/QueueTransferDialog';
import { QueueType } from '@/hooks/useQueueTypes';

interface QueueTransferDialogContainerProps {
  queueToTransfer: Queue | null;
  transferDialogOpen: boolean;
  onOpenChange: (open: boolean) => void;
  servicePoints: ServicePoint[];
  queueTypes: QueueType[];
  onTransfer?: (
    queueId: string, 
    sourceServicePointId: string,
    targetServicePointId: string,
    notes?: string,
    newQueueType?: string
  ) => Promise<boolean>;
}

const QueueTransferDialogContainer: React.FC<QueueTransferDialogContainerProps> = ({
  queueToTransfer,
  transferDialogOpen,
  onOpenChange,
  servicePoints,
  queueTypes,
  onTransfer
}) => {
  if (!onTransfer || !queueToTransfer) return null;

  // Handle the simple transfer - just pass the target service point
  const handleSimpleTransfer = async (targetServicePointId: string) => {
    if (!queueToTransfer.service_point_id) return;
    
    await onTransfer(
      queueToTransfer.id,
      queueToTransfer.service_point_id,
      targetServicePointId
    );
  };

  return (
    <QueueTransferDialog
      open={transferDialogOpen}
      onOpenChange={onOpenChange}
      onTransfer={handleSimpleTransfer}
      servicePoints={servicePoints}
      currentServicePointId={queueToTransfer.service_point_id || ''}
    />
  );
};

export default QueueTransferDialogContainer;
