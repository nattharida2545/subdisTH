
import { v4 as uuidv4 } from 'uuid';
import { QueueAlgorithmType } from '@/utils/queueAlgorithms';
import { QueueType } from '@/hooks/useQueueTypes';
import { UseQueueTypeActionsProps, FormQueueType } from './types';

export const useQueueTypeAddEdit = ({
  form,
  setEditingQueueType,
  setNewQueueType,
  newQueueType
}: UseQueueTypeActionsProps) => {
  // Add a new queue type
  const handleAddQueueType = () => {
    const queueTypes = form.getValues('queue_types') || [];
    
    // Create a new queue type with a random ID
    const newId = uuidv4();
    const newQueueType: FormQueueType = {
      id: newId,
      code: '',
      name: '',
      prefix: '', // Required field
      purpose: '',
      format: '00',
      enabled: true,
      algorithm: QueueAlgorithmType.FIFO,
      priority: 5
    };
    
    // Update the form with the new queue type
    form.setValue('queue_types', [...queueTypes, newQueueType]);
    
    // Start editing the new queue type
    setEditingQueueType(newId);
    setNewQueueType(true);
  };

  // Edit an existing queue type
  const handleEditQueueType = (id: string) => {
    setEditingQueueType(id);
    setNewQueueType(false);
  };

  // Save the currently edited queue type
  const handleSaveQueueType = (index: number) => {
    // Validate the queue type before saving
    const queueType = form.getValues(`queue_types.${index}`);
    if (!queueType.code || !queueType.name || !queueType.prefix) {
      return;
    }
    
    setEditingQueueType(null);
    setNewQueueType(false);
  };

  // Cancel editing a queue type
  const handleCancelEdit = (index: number) => {
    const queueTypes = [...form.getValues('queue_types')];
    
    if (newQueueType) {
      // If we're canceling a new queue type, remove it
      queueTypes.splice(index, 1);
      form.setValue('queue_types', queueTypes);
    }
    
    setEditingQueueType(null);
    setNewQueueType(false);
  };

  return {
    handleAddQueueType,
    handleEditQueueType,
    handleSaveQueueType,
    handleCancelEdit
  };
};
