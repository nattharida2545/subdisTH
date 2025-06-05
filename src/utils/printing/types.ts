
import { QueueTypeEnum } from '@/integrations/supabase/schema';

export interface PrintQueueOptions {
  queueNumber: number;
  queueType: QueueTypeEnum;
  patientName?: string;
  patientPhone?: string;
  patientLineId?: string;
  purpose?: string;
  estimatedWaitTime?: number;
}
