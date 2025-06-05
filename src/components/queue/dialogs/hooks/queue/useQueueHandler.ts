
import * as React from 'react';
import { useQueueCreation } from './useQueueCreation';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useQueueHandler');

export const useQueueHandler = () => {
  const {
    queueType,
    setQueueType,
    notes,
    setNotes,
    resetQueueCreation,
    createQueue,
    queueTypePurposes
  } = useQueueCreation();

  const handleQueueTypeChange = (type: string) => {
    logger.debug(`Queue type changed to: ${type}`);
    setQueueType(type as any);
  };

  const handleNotesChange = (newNotes: string) => {
    logger.debug(`Queue notes updated: ${newNotes}`);
    setNotes(newNotes);
  };

  return {
    queueType,
    setQueueType,
    notes,
    setNotes,
    handleQueueTypeChange,
    handleNotesChange,
    resetQueueCreation,
    createQueue,
    queueTypePurposes
  };
};
