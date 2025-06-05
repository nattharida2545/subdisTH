
import { useState } from 'react';

export const useQueueTypesState = () => {
  const [editingQueueType, setEditingQueueType] = useState<string | null>(null);
  const [newQueueType, setNewQueueType] = useState(false);

  return {
    editingQueueType,
    setEditingQueueType,
    newQueueType,
    setNewQueueType
  };
};
