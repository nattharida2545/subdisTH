
import { UseQueueTypeActionsProps, QueueTypeActions } from './types';
import { useQueueTypeAddEdit } from './useQueueTypeAddEdit';
import { useQueueTypeModify } from './useQueueTypeModify';

// Main hook that combines all queue type actions
export const useQueueTypeActions = (props: UseQueueTypeActionsProps): QueueTypeActions => {
  const addEditActions = useQueueTypeAddEdit(props);
  const modifyActions = useQueueTypeModify(props);

  return {
    ...addEditActions,
    ...modifyActions
  };
};

export * from './types';
