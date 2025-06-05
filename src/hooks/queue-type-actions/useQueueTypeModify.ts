
import { v4 as uuidv4 } from 'uuid';
import { QueueType, ensureValidFormat, ensureValidAlgorithm } from '@/hooks/useQueueTypes';
import { QueueAlgorithmType } from '@/utils/queueAlgorithms';
import { UseQueueTypeActionsProps, FormQueueType } from './types';

export const useQueueTypeModify = ({
  form
}: UseQueueTypeActionsProps) => {
  // Remove a queue type
  const handleRemoveQueueType = (index: number) => {
    const queueTypes = [...form.getValues('queue_types')];
    queueTypes.splice(index, 1);
    form.setValue('queue_types', queueTypes);
  };

  // Duplicate a queue type
  const handleDuplicateQueueType = (index: number) => {
    const queueTypes = [...form.getValues('queue_types')];
    const queueTypeToDuplicate = queueTypes[index];
    
    // Create a copy with a new ID and ensure all required fields are present
    const duplicatedQueueType: FormQueueType = {
      id: uuidv4(),
      code: `${queueTypeToDuplicate.code}_COPY`,
      name: `${queueTypeToDuplicate.name} (Copy)`,
      prefix: queueTypeToDuplicate.prefix || '', // Ensure prefix is not undefined
      purpose: queueTypeToDuplicate.purpose || '',
      format: ensureValidFormat(queueTypeToDuplicate.format),
      enabled: queueTypeToDuplicate.enabled !== undefined ? queueTypeToDuplicate.enabled : true,
      algorithm: ensureValidAlgorithm(queueTypeToDuplicate.algorithm) as QueueAlgorithmType,
      priority: queueTypeToDuplicate.priority !== undefined ? queueTypeToDuplicate.priority : 5
    };
    
    queueTypes.splice(index + 1, 0, duplicatedQueueType);
    form.setValue('queue_types', queueTypes);
  };

  // Change a specific field of a queue type
  const handleQueueTypeChange = (index: number, field: keyof QueueType, value: any) => {
    // Get the current queue types array
    const queueTypes = [...form.getValues('queue_types')];
    
    // Update the specific field in the queue type at the given index
    if (queueTypes[index]) {
      queueTypes[index] = {
        ...queueTypes[index],
        [field]: value
      };
      
      // Update the entire queue_types array at once
      form.setValue('queue_types', queueTypes);
    }
  };

  return {
    handleRemoveQueueType,
    handleDuplicateQueueType,
    handleQueueTypeChange
  };
};
