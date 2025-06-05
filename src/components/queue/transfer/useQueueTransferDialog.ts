
import { useState } from 'react';
import { Queue } from '@/integrations/supabase/schema';

export const useQueueTransferDialog = () => {
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [queueToTransfer, setQueueToTransfer] = useState<Queue | null>(null);

  const openTransferDialog = (queue: Queue) => {
    setQueueToTransfer(queue);
    setTransferDialogOpen(true);
  };

  const closeTransferDialog = () => {
    setTransferDialogOpen(false);
    setQueueToTransfer(null);
  };

  return {
    transferDialogOpen,
    queueToTransfer,
    openTransferDialog,
    closeTransferDialog
  };
};
