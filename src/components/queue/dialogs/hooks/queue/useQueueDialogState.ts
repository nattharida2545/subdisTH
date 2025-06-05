
import * as React from 'react';
import { QueueType } from '@/integrations/supabase/schema';
import { createLogger } from '@/utils/logger';
import { QueueDialogState, QueueDialogActions } from './types';

const logger = createLogger('useQueueDialogState');

export const useQueueDialogState = (onOpenChange: (open: boolean) => void): QueueDialogState & QueueDialogActions => {
  const [qrDialogOpen, setQrDialogOpen] = React.useState(false);
  const [createdQueueNumber, setCreatedQueueNumber] = React.useState<number | null>(null);
  const [createdQueueType, setCreatedQueueType] = React.useState<QueueType>('GENERAL');
  const [createdPurpose, setCreatedPurpose] = React.useState('');

  // Use useCallback for setQrDialogOpen to prevent unnecessary re-renders
  const handleSetQrDialogOpen = React.useCallback((open: boolean) => {
    logger.verbose(`Setting QR dialog open: ${open}`);
    setQrDialogOpen(open);
  }, []);

  // Reset all state
  const resetQueueDialog = React.useCallback(() => {
    logger.verbose('Resetting dialog state');
    setQrDialogOpen(false);
    setCreatedQueueNumber(null);
    setCreatedQueueType('GENERAL');
    setCreatedPurpose('');
  }, []);

  return {
    qrDialogOpen,
    setQrDialogOpen: handleSetQrDialogOpen,
    createdQueueNumber,
    setCreatedQueueNumber,
    createdQueueType,
    setCreatedQueueType,
    createdPurpose,
    setCreatedPurpose,
    resetQueueDialog
  };
};
