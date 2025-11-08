// Type declarations for INS Queue components
declare module '@/hooks/useInsQueues' {
  import { QueueIns, QueueStatus } from '@/integrations/supabase/schema';
  
  export function useInsQueues(): {
    queues: QueueIns[];
    allQueues: QueueIns[];
    allQueuesNofilter: QueueIns[];
    loading: boolean;
    error: Error | null;
    fetchQueues: () => Promise<void>;
    addQueue: (queue: Partial<QueueIns>) => Promise<QueueIns | null>;
    updateQueueStatus: (queueId: string, status: QueueStatus, additionalData?: any) => Promise<void>;
    removeQueue: (queueId: string) => Promise<void>;
    getQueuesByStatus: (status: QueueStatus) => Promise<QueueIns[]>;
    callQueue: (queueId: string) => Promise<void>;
    recallQueue: (queueId: string) => Promise<void>;
    voiceEnabled: boolean;
    setVoiceEnabled: (enabled: boolean) => void;
    counterName: string;
    setCounterName: (name: string) => void;
    updateQueueSettings: (settings: { voiceEnabled: boolean; counterName: string }) => void;
    getNextQueueToCall: () => Promise<QueueIns | null>;
    transferQueueToServicePoint: (queueId: string, servicePointId: string) => Promise<void>;
    putQueueOnHold: (queueId: string) => Promise<void>;
    returnSkippedQueueToWaiting: (queueId: string) => Promise<void>;
  };
}

declare module '*/QueueInsBoardContent' {
  import React from 'react';
  import { QueueIns, ServicePointIns } from '@/integrations/supabase/schema';
  
  interface QueueInsBoardContentProps {
    activeQueues: QueueIns[];
    waitingQueues: QueueIns[];
    completedQueues: QueueIns[];
    findServicePoint: (servicePointId: string | null) => ServicePointIns | null;
  }
  
  const QueueInsBoardContent: React.FC<QueueInsBoardContentProps>;
  export default QueueInsBoardContent;
}
