
import { Queue, ServicePoint } from '@/integrations/supabase/schema';
import { QueueType } from '@/hooks/useQueueTypes';

export interface QueueTransferDialogProps {
  queue: Queue | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  servicePoints: ServicePoint[];
  queueTypes: QueueType[];
  currentServicePointId?: string;
  onTransfer: (
    queueId: string,
    sourceServicePointId: string,
    targetServicePointId: string,
    notes?: string,
    newQueueType?: string
  ) => Promise<boolean>;
}

export interface TransferFormState {
  targetServicePointId: string;
  notes: string;
  newQueueType: string;
}
