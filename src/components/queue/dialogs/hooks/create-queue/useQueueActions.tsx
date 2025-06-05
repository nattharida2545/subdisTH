
import * as React from 'react';
import { toast } from 'sonner';
import { createLogger } from '@/utils/logger';
import { supabase } from '@/integrations/supabase/client';
import { QueueType } from '@/integrations/supabase/schema';
import { queueTypePurposes } from '../queue/useQueueCreation';
import { QueueCreationResult } from '@/components/queue/hooks/types';

const logger = createLogger('useQueueActions');

/**
 * Hook that manages queue creation actions and related state
 */
export const useQueueActions = () => {
  // Queue state
  const [queueType, setQueueType] = React.useState<QueueType>('GENERAL');
  const [notes, setNotes] = React.useState('');
  
  // Dialog state
  const [qrDialogOpen, setQrDialogOpen] = React.useState(false);
  const [createdQueueNumber, setCreatedQueueNumber] = React.useState<number | null>(null);
  const [createdQueueType, setCreatedQueueType] = React.useState<QueueType>('GENERAL');
  const [createdPurpose, setCreatedPurpose] = React.useState('');

  /**
   * Gets the next queue number from the database
   */
  const getNextQueueNumber = React.useCallback(async (): Promise<number> => {
    try {
      const { data: queueCountData, error } = await supabase
        .from('queues')
        .select('number')
        .order('number', { ascending: false })
        .limit(1);
      
      if (error) {
        throw error;
      }
      
      return queueCountData && queueCountData.length > 0 
        ? queueCountData[0].number + 1 
        : 1;
    } catch (err) {
      logger.error('Error getting next queue number:', err);
      throw new Error('Failed to get next queue number');
    }
  }, []);

  /**
   * Creates a new queue for an existing patient
   */
  const createQueueForExistingPatient = React.useCallback(async (
    patientId: string
  ): Promise<QueueCreationResult | null> => {
    try {
      const nextQueueNumber = await getNextQueueNumber();
      
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
        throw error;
      }
      
      if (!data || data.length === 0) {
        throw new Error('No data returned after creating queue');
      }
      
      // Update dialog state
      setCreatedQueueNumber(data[0].number);
      setCreatedQueueType(data[0].type as QueueType);
      setCreatedPurpose(queueTypePurposes[data[0].type]);
      setQrDialogOpen(true);
      
      return data[0] as QueueCreationResult;
    } catch (err) {
      logger.error('Error creating queue for existing patient:', err);
      toast.error('ไม่สามารถสร้างคิวได้');
      return null;
    }
  }, [queueType, notes, getNextQueueNumber]);

  /**
   * Creates a new patient and then creates a queue for them
   */
  const createQueueForNewPatient = React.useCallback(async (
    patientName: string,
    phoneNumber: string
  ): Promise<QueueCreationResult | null> => {
    try {
      // Generate a patient ID
      const patientIdNum = Math.floor(1000 + Math.random() * 9000);
      const patient_id = `P${patientIdNum}`;
      
      // Create the patient
      const { data: newPatientData, error: patientError } = await supabase
        .from('patients')
        .insert({
          name: patientName,
          phone: phoneNumber,
          patient_id: patient_id,
        })
        .select();
      
      if (patientError) {
        throw patientError;
      }
      
      if (!newPatientData || newPatientData.length === 0) {
        throw new Error('No data returned after creating patient');
      }
      
      // Create a queue for the new patient
      return await createQueueForExistingPatient(newPatientData[0].id);
    } catch (err) {
      logger.error('Error creating queue for new patient:', err);
      toast.error('ไม่สามารถสร้างผู้ป่วยใหม่และคิวได้');
      return null;
    }
  }, [createQueueForExistingPatient]);

  /**
   * Main function that handles queue creation for either existing or new patients
   */
  const createQueueForPatient = React.useCallback(async (
    patientId: string,
    newPatientName: string,
    phoneNumber: string
  ): Promise<QueueCreationResult | null> => {
    try {
      if (patientId) {
        // Create queue for existing patient
        return await createQueueForExistingPatient(patientId);
      } else if (newPatientName && phoneNumber) {
        // Create queue for new patient
        return await createQueueForNewPatient(newPatientName, phoneNumber);
      } else {
        toast.error('ไม่มีข้อมูลผู้ป่วยที่เพียงพอ');
        return null;
      }
    } catch (err) {
      logger.error('Error in createQueueForPatient:', err);
      toast.error('เกิดข้อผิดพลาดในการสร้างคิว');
      return null;
    }
  }, [createQueueForExistingPatient, createQueueForNewPatient]);

  // Reset functions
  const resetQueueState = React.useCallback(() => {
    setQueueType('GENERAL');
    setNotes('');
  }, []);

  const resetDialogState = React.useCallback(() => {
    setQrDialogOpen(false);
    setCreatedQueueNumber(null);
    setCreatedQueueType('GENERAL');
    setCreatedPurpose('');
  }, []);

  return {
    queueState: {
      queueType,
      setQueueType,
      notes,
      setNotes,
      queueTypePurposes
    },
    dialogState: {
      qrDialogOpen,
      setQrDialogOpen,
      createdQueueNumber,
      createdQueueType,
      createdPurpose
    },
    createQueueForPatient,
    resetQueueState,
    resetDialogState
  };
};
