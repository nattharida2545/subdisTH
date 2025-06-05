
import React, { createContext, useContext, ReactNode } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { queueSettingsSchema } from '@/components/settings/schemas';
import { useSettingsForm } from '@/hooks/useSettingsForm';
import { useSettingsSubmission } from '@/hooks/useSettingsSubmission';
import { useQueueTypeState } from '@/hooks/useQueueTypeState';
import { useQueueTypeActions } from '@/hooks/queue-type-actions';
import { QueueType } from '@/hooks/useQueueTypes';

// Define the form values type from the schema
export type SettingsFormValues = z.infer<typeof queueSettingsSchema>;

interface SettingsContextType {
  form: UseFormReturn<SettingsFormValues>;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
  settings: any;
  loading: boolean;
  loadingQueueTypes: boolean;
  editingQueueType: string | null;
  setEditingQueueType: (id: string | null) => void;
  newQueueType: boolean;
  setNewQueueType: (value: boolean) => void;
  onSubmit: (data: SettingsFormValues) => Promise<void>;
  updateMultipleSettings: (data: any) => Promise<boolean>;
  handleAddQueueType: () => void;
  handleRemoveQueueType: (index: number) => void;
  handleEditQueueType: (id: string) => void;
  handleSaveQueueType: (index: number) => void;
  handleCancelEdit: (index: number) => void;
  handleDuplicateQueueType: (index: number) => void;
  handleQueueTypeChange: (index: number, field: any, value: any) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Use our custom hooks
  const { form, settings, loading, loadingQueueTypes, updateMultipleSettings } = useSettingsForm();
  const { editingQueueType, setEditingQueueType, newQueueType, setNewQueueType } = useQueueTypeState();
  const { isSubmitting, setIsSubmitting, onSubmit } = useSettingsSubmission({ 
    form, 
    updateMultipleSettings 
  });
  
  // Pass the state to the queue type actions
  const queueTypeActions = useQueueTypeActions({
    form,
    setEditingQueueType,
    setNewQueueType,
    newQueueType
  });

  const value: SettingsContextType = {
    form,
    isSubmitting,
    setIsSubmitting,
    settings,
    loading,
    loadingQueueTypes,
    editingQueueType,
    setEditingQueueType,
    newQueueType,
    setNewQueueType,
    onSubmit,
    updateMultipleSettings,
    ...queueTypeActions
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettingsContext = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettingsContext must be used within a SettingsProvider');
  }
  return context;
};
