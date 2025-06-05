
import { QueueType } from '@/integrations/supabase/schema';

export interface QueueCreationState {
  queueType: QueueType;
  notes: string;
}

export interface QueueCreationActions {
  setQueueType: (queueType: QueueType) => void;
  setNotes: (notes: string) => void;
  resetQueueCreation: () => void;
  createQueue: (patientId: string) => Promise<any>;
}

export type QueueTypePurposes = Record<string, string>;

export interface QueueDialogState {
  qrDialogOpen: boolean;
  createdQueueNumber: number | null;
  createdQueueType: QueueType;
  createdPurpose: string;
}

export interface QueueDialogActions {
  setQrDialogOpen: (open: boolean) => void;
  setCreatedQueueNumber: (number: number | null) => void;
  setCreatedQueueType: (type: QueueType) => void;
  setCreatedPurpose: (purpose: string) => void;
  resetQueueDialog: () => void;
}
