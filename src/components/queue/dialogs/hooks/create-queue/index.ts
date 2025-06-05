
import { useCreateQueueHook } from './useCreateQueueHook';
import { usePatientInfoHook } from './usePatientInfoHook';
import { useQueueActions } from './useQueueActions';
import { CreateQueueHookProps, CreateQueueHookReturn } from '@/components/queue/hooks/types';

/**
 * Main hook for creating queues
 */
export const useCreateQueue = (
  onOpenChange: (open: boolean) => void,
  onCreateQueue: (queue: any) => void
): CreateQueueHookReturn => useCreateQueueHook(onOpenChange, onCreateQueue);

export {
  usePatientInfoHook,
  useQueueActions
};

// Re-export the types
export * from '@/components/queue/hooks/types';
