
import * as React from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { createLogger } from '@/utils/logger';
import { NewPatientCreationState, NewPatientCreationActions, NewPatientCreationResult } from './types';

const logger = createLogger('useNewPatientCreation');

export const useNewPatientCreation = (): NewPatientCreationState & NewPatientCreationActions => {
  const [showNewPatientForm, setShowNewPatientForm] = React.useState(false);
  const [newPatientName, setNewPatientName] = React.useState('');

  const resetNewPatientCreation = React.useCallback(() => {
    setShowNewPatientForm(false);
    setNewPatientName('');
  }, []);

  const createNewPatient = React.useCallback(async (
    name?: string,
    phoneNumber?: string
  ): Promise<NewPatientCreationResult | null> => {
    const patientName = name || newPatientName;
    
    if (!patientName || !phoneNumber) {
      logger.warn('Cannot create patient: Missing name or phone');
      return null;
    }
    
    logger.info(`Creating new patient - name: ${patientName}, phone: ${phoneNumber}`);
    
    try {
      // Generate a patient_id with format P + 4 digits
      const patientIdNum = Math.floor(1000 + Math.random() * 9000);
      const patient_id = `P${patientIdNum}`;
      logger.debug(`Generated patient_id: ${patient_id}`);
      
      logger.debug('Inserting patient into database');
      const { data: newPatientData, error } = await supabase
        .from('patients')
        .insert({
          name: patientName,
          phone: phoneNumber,
          patient_id: patient_id,
        })
        .select();
      
      if (error) {
        logger.error('Supabase error:', error);
        throw error;
      }
      
      if (newPatientData && newPatientData.length > 0) {
        logger.info('Patient created successfully:', newPatientData[0]);
        toast.success(`สร้างข้อมูลผู้ป่วยใหม่: ${patientName}`);
        return newPatientData[0] as NewPatientCreationResult;
      }
      
      logger.warn('No patient data returned after insert');
      return null;
    } catch (err) {
      logger.error('Error creating new patient:', err);
      toast.error('ไม่สามารถสร้างข้อมูลผู้ป่วยใหม่ได้');
      return null;
    }
  }, [newPatientName]);

  // This function acts as a bridge for older components that use handleAddNewPatient
  const handleAddNewPatient = React.useCallback(async (): Promise<NewPatientCreationResult | null> => {
    return null; // Implementation will be provided by parent components
  }, []);

  return {
    showNewPatientForm,
    setShowNewPatientForm,
    newPatientName,
    setNewPatientName,
    handleAddNewPatient,
    createNewPatient,
    resetNewPatientCreation
  };
};
