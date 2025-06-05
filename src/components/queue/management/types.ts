
import { Queue, QueueStatus, ServicePoint } from '@/integrations/supabase/schema';
import { QueueType } from '@/hooks/useQueueTypes';

export interface QueueManagementProps {
  queues: Queue[];
  patients: any[];
  queueTypes: QueueType[];
  servicePoints: ServicePoint[];
  selectedServicePoint?: ServicePoint | null;
  onUpdateStatus: (queueId: string, status: QueueStatus) => Promise<Queue | null>;
  onCallQueue: (queueId: string) => Promise<Queue | null>;
  onRecallQueue: (queueId: string) => void;
  onTransferQueue?: (
    queueId: string, 
    sourceServicePointId: string,
    targetServicePointId: string,
    notes?: string,
    newQueueType?: string
  ) => Promise<boolean>;
  onHoldQueue?: (queueId: string, servicePointId: string, reason?: string) => Promise<boolean>;
  onReturnToWaiting?: (queueId: string) => Promise<boolean>;
}

export interface ServicePointSelectorProps {
  selectedServicePoint?: ServicePoint | null;
  servicePoints: ServicePoint[];
  onServicePointChange: (value: string) => void;
}
