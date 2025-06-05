
import { QueueType } from '@/integrations/supabase/schema';

// Queue type format mapping
export const queueTypeFormat = {
  'GENERAL': { prefix: 'A', padLength: 3 },
  'PRIORITY': { prefix: 'P', padLength: 3 },
  'ELDERLY': { prefix: 'E', padLength: 3 },
  'FOLLOW_UP': { prefix: 'F', padLength: 3 },
  'URGENT': { prefix: 'U', padLength: 3 },
  'SPECIAL': { prefix: 'S', padLength: 3 },
};

// Format the queue number with the type prefix
export const formatQueueNumber = (queueType: QueueType, queueNumber: number): string => {
  // Get the format configuration for this queue type
  const format = queueTypeFormat[queueType];
  
  // If format is not found, use a default format
  if (!format) {
    console.warn(`Queue type format not found for: ${queueType}, using default format`);
    const defaultPrefix = queueType?.charAt(0) || 'Q'; // Use first letter or 'Q' as fallback
    return `${defaultPrefix}${queueNumber.toString().padStart(3, '0')}`;
  }
  
  return `${format.prefix}${queueNumber.toString().padStart(format.padLength, '0')}`;
};

// Calculate waiting time in minutes
export const calculateWaitingTime = (createdAt: string, calledAt?: string): string => {
  if (!createdAt || !calledAt) return '?';
  
  const createdTime = new Date(createdAt).getTime();
  const calledTime = new Date(calledAt).getTime();
  const diffMinutes = Math.round((calledTime - createdTime) / (1000 * 60));
  
  return `${diffMinutes} นาที`;
};

// Calculate service time in minutes
export const calculateServiceTime = (calledAt?: string, completedAt?: string): string => {
  if (!calledAt || !completedAt) return '?';
  
  const calledTime = new Date(calledAt).getTime();
  const completedTime = new Date(completedAt).getTime();
  const diffMinutes = Math.round((completedTime - calledTime) / (1000 * 60));
  
  return `${diffMinutes} นาที`;
};
