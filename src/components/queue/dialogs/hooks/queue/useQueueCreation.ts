
import * as React from 'react';
import { QueueType } from '@/integrations/supabase/schema';
import { createLogger } from '@/utils/logger';
import { supabase } from '@/integrations/supabase/client';
import { QueueCreationState, QueueCreationActions, QueueTypePurposes } from './types';

const logger = createLogger('useQueueCreation');

// Define the queue type purposes
export const queueTypePurposes: QueueTypePurposes = {
  'GENERAL': 'ทั่วไป',
  'PRIORITY': 'กรณีเร่งด่วน',
  'ELDERLY': 'ผู้สูงอายุ 60 ปีขึ้นไป',
  'FOLLOW_UP': 'ติดตามการรักษา'
};

export const useQueueCreation = (): QueueCreationState & QueueCreationActions & { queueTypePurposes: QueueTypePurposes } => {
  logger.debug('Hook initialized');
  
  const [queueType, setQueueType] = React.useState<QueueType>('GENERAL');
  const [notes, setNotes] = React.useState('');
  
  const resetQueueCreation = React.useCallback(() => {
    logger.debug('Resetting queue creation state');
    setQueueType('GENERAL');
    setNotes('');
  }, []);

  // Method to get next queue number for specific type
  const getNextQueueNumber = async (queueTypeCode: string) => {
    try {
      const { data: lastQueue } = await supabase
        .from('queues')
        .select('number')
        .eq('type', queueTypeCode)
        .eq('queue_date', new Date().toISOString().split('T')[0])
        .order('number', { ascending: false })
        .limit(1)
        .maybeSingle();

      const nextNumber = (lastQueue?.number || 0) + 1;
      logger.debug(`Next queue number for ${queueTypeCode}: ${nextNumber}`);
      return nextNumber;
    } catch (error) {
      logger.warn(`Error getting last queue number for ${queueTypeCode}:`, error);
      return 1; // Default to 1 if error
    }
  };

  // Method to create a queue
  const createQueue = async (patientId: string) => {
    logger.debug('Creating queue for patient', patientId);
    
    try {
      // Get the next queue number for this specific queue type
      const nextQueueNumber = await getNextQueueNumber(queueType);
      
      // Create queue in Supabase
      const { data, error } = await supabase
        .from('queues')
        .insert({
          patient_id: patientId,
          number: nextQueueNumber,
          type: queueType,
          status: 'WAITING',
          notes: notes,
          queue_date: new Date().toISOString().split('T')[0]
        })
        .select();
      
      if (error) {
        logger.error('Error creating queue:', error);
        throw error;
      }
      
      return data && data.length > 0 ? data[0] : null;
    } catch (err) {
      logger.error('Error in createQueue:', err);
      throw err;
    }
  };

  return {
    queueType,
    setQueueType,
    notes,
    setNotes,
    resetQueueCreation,
    createQueue,
    queueTypePurposes
  };
};
