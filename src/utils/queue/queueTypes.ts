
import { QueueTypeEnum, QueueStatus } from '@/integrations/supabase/schema';
import { QueueType, ensureValidFormat, ensureValidAlgorithm } from '@/hooks/useQueueTypes';

// Helper function to safely cast a string to QueueTypeEnum
export const ensureQueueTypeEnum = (type: string): QueueTypeEnum => {
  const validTypes: QueueTypeEnum[] = ['GENERAL', 'PRIORITY', 'ELDERLY', 'FOLLOW_UP'];
  return validTypes.includes(type as QueueTypeEnum) 
    ? type as QueueTypeEnum 
    : 'GENERAL';
};

// Helper function to safely cast a string to QueueStatus
export const ensureQueueStatus = (status: string): QueueStatus => {
  const validStatuses: QueueStatus[] = ['WAITING', 'ACTIVE', 'COMPLETED', 'SKIPPED', 'CANCELLED'];
  return validStatuses.includes(status as QueueStatus)
    ? status as QueueStatus
    : 'WAITING';
};

// Helper to safely get priority from queue_type data
export const safeGetPriority = (queueType: any): number => {
  // Check if the queue_type exists and has priority property
  if (queueType && typeof queueType === 'object') {
    return typeof queueType.priority === 'number' ? queueType.priority : 5;
  }
  return 5; // Default priority if there's an issue
};

// Convert a QueueType to QueueTypeEnum if needed
export const getQueueTypeCode = (queueType: QueueType | string): string => {
  if (typeof queueType === 'string') {
    return queueType;
  }
  return queueType.code;
};
