
import { useState, useEffect } from 'react';
import { Queue } from '@/integrations/supabase/schema';
import { createLogger } from '@/utils/logger';
import { TransferFormState } from './types';

const logger = createLogger('useQueueTransfer');

export const useQueueTransfer = (
  queue: Queue | null,
  open: boolean,
  currentServicePointId?: string,
  onTransfer?: (
    queueId: string,
    sourceServicePointId: string,
    targetServicePointId: string,
    notes?: string,
    newQueueType?: string
  ) => Promise<boolean>
) => {
  // State for the form
  const [formState, setFormState] = useState<TransferFormState>({
    targetServicePointId: '',
    notes: '',
    newQueueType: '',
  });
  const [isTransferring, setIsTransferring] = useState(false);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open && queue) {
      setFormState({
        targetServicePointId: '',
        notes: '',
        newQueueType: '',
      });
      setIsTransferring(false);
    }
  }, [open, queue]);

  // Field change handlers
  const handleTargetServicePointChange = (value: string) => {
    setFormState(prev => ({ ...prev, targetServicePointId: value }));
  };

  const handleNotesChange = (value: string) => {
    setFormState(prev => ({ ...prev, notes: value }));
  };

  const handleQueueTypeChange = (value: string) => {
    setFormState(prev => ({ ...prev, newQueueType: value }));
  };

  // Function to handle the transfer
  const handleTransfer = async () => {
    if (!queue || !formState.targetServicePointId || !currentServicePointId || !onTransfer) return;
    
    setIsTransferring(true);
    
    try {
      const success = await onTransfer(
        queue.id,
        currentServicePointId,
        formState.targetServicePointId,
        formState.notes,
        formState.newQueueType
      );
      
      return success;
    } catch (error) {
      logger.error('Error transferring queue:', error);
      return false;
    } finally {
      setIsTransferring(false);
    }
  };

  return {
    formState,
    isTransferring,
    handleTargetServicePointChange,
    handleNotesChange,
    handleQueueTypeChange,
    handleTransfer
  };
};
