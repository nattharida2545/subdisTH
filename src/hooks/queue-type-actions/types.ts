
import { UseFormReturn } from 'react-hook-form';
import { QueueAlgorithmType } from '@/utils/queueAlgorithms';
import { QueueType } from '@/hooks/useQueueTypes';
import { SettingsFormValues } from '@/contexts/SettingsContext';

export interface UseQueueTypeActionsProps {
  form: UseFormReturn<SettingsFormValues>;
  setEditingQueueType: (id: string | null) => void;
  setNewQueueType: (value: boolean) => void;
  newQueueType: boolean;
}

// Create a type that ensures algorithm is QueueAlgorithmType
export interface FormQueueType {
  id: string;
  code: string;
  name: string;
  prefix: string;
  purpose?: string;
  format: "0" | "00" | "000";
  enabled: boolean;
  algorithm: QueueAlgorithmType;
  priority: number;
}

export interface QueueTypeActions {
  handleAddQueueType: () => void;
  handleRemoveQueueType: (index: number) => void;
  handleEditQueueType: (id: string) => void;
  handleSaveQueueType: (index: number) => void;
  handleCancelEdit: (index: number) => void;
  handleDuplicateQueueType: (index: number) => void;
  handleQueueTypeChange: (index: number, field: keyof QueueType, value: any) => void;
}
