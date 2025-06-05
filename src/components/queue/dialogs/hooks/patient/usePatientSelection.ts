import * as React from 'react';
import { createLogger } from '@/utils/logger';
import type { Patient } from '@/integrations/supabase/schema';
import { PatientSelectionState, PatientSelectionActions } from './types';

const logger = createLogger('usePatientSelection');

export const usePatientSelection = (): PatientSelectionState & PatientSelectionActions => {
  const [patientId, setPatientId] = React.useState('');
  const [patientName, setPatientName] = React.useState('');
  const [patientPhone, setPatientPhone] = React.useState('');
  const [lineId, setLineId] = React.useState('');
  const [newPatientName, setNewPatientName] = React.useState('');
  
  // Additional states needed by usePatientQueueInfo
  const [selectedPatientName, setSelectedPatientName] = React.useState('');
  const [selectedPatientPhone, setSelectedPatientPhone] = React.useState('');
  const [selectedPatientLineId, setSelectedPatientLineId] = React.useState('');

  // Compute the final patient info
  const finalPatientName = patientName || newPatientName;
  const finalPatientPhone = patientPhone;
  const finalPatientLineId = lineId;

  const handleSelectPatient = React.useCallback((id: string, patients?: Patient[]) => {
    logger.debug(`Selecting patient with ID: ${id}`);
    
    if (patients && patients.length > 0) {
      const selected = patients.find(p => p.id === id);
      
      if (selected) {
        logger.debug(`Found patient: ${selected.name}`);
        setPatientId(selected.id);
        setPatientName(selected.name);
        setPatientPhone(selected.phone);
        setLineId(selected.line_id || '');
        
        // Update selected patient info
        setSelectedPatientName(selected.name);
        setSelectedPatientPhone(selected.phone);
        setSelectedPatientLineId(selected.line_id || '');
      }
    }
  }, []);

  const updateFinalPatientInfo = React.useCallback(() => {
    // This function would update the final patient info if needed
    // Currently the values are computed directly, but we keep this
    // method for compatibility with usePatientQueueInfo
  }, []);

  const resetPatientSelection = React.useCallback(() => {
    setPatientId('');
    setPatientName('');
    setPatientPhone('');
    setLineId('');
    setNewPatientName('');
    setSelectedPatientName('');
    setSelectedPatientPhone('');
    setSelectedPatientLineId('');
  }, []);

  return {
    patientId,
    setPatientId,
    patientName,
    setPatientName,
    patientPhone,
    setPatientPhone,
    lineId,
    setLineId,
    newPatientName,
    setNewPatientName,
    selectedPatientName,
    selectedPatientPhone,
    selectedPatientLineId,
    finalPatientName,
    finalPatientPhone,
    finalPatientLineId,
    handleSelectPatient,
    updateFinalPatientInfo,
    resetPatientSelection
  };
};
