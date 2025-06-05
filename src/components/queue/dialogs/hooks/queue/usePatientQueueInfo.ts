
import * as React from 'react';
import { toast } from 'sonner';
import { createLogger } from '@/utils/logger';
import { useQueuePatientSearch } from './useQueuePatientSearch';
import { useQueuePatientSelection } from './useQueuePatientSelection';
import { useQueueNewPatient } from './useQueueNewPatient';

const logger = createLogger('usePatientQueueInfo');

export const usePatientQueueInfo = () => {
  // Local state for better control over the UI
  const [localShowNewPatientForm, setLocalShowNewPatientForm] = React.useState(false);
  
  // Initialize search hook
  const {
    phoneNumber,
    setPhoneNumber,
    isSearching,
    matchedPatients,
    handlePhoneSearch,
    resetPatientSearch
  } = useQueuePatientSearch();
  
  // Initialize patient selection hook
  const {
    patientId,
    setPatientId,
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
  } = useQueuePatientSelection(matchedPatients);
  
  // Initialize new patient creation hook
  const {
    createNewPatient,
    handleAddNewPatient,
  } = useQueueNewPatient(setLocalShowNewPatientForm, setPatientId);
  
  // Reset all state
  const resetAll = React.useCallback(() => {
    logger.debug('Resetting all patient queue info state');
    resetPatientSearch();
    resetPatientSelection();
    setLocalShowNewPatientForm(false);
  }, [resetPatientSearch, resetPatientSelection]);

  // Return a memoized object to prevent unnecessary re-renders
  return React.useMemo(() => ({
    phoneNumber,
    setPhoneNumber,
    isSearching,
    matchedPatients,
    showNewPatientForm: localShowNewPatientForm,
    newPatientName,
    setNewPatientName,
    patientId,
    selectedPatientName,
    selectedPatientPhone,
    selectedPatientLineId,
    finalPatientName,
    finalPatientPhone,
    finalPatientLineId,
    handlePhoneSearch,
    handleAddNewPatient,
    handleSelectPatient,
    createNewPatient,
    updateFinalPatientInfo,
    resetAll
  }), [
    phoneNumber,
    setPhoneNumber,
    isSearching,
    matchedPatients,
    localShowNewPatientForm,
    newPatientName,
    setNewPatientName,
    patientId,
    selectedPatientName,
    selectedPatientPhone,
    selectedPatientLineId,
    finalPatientName,
    finalPatientPhone,
    finalPatientLineId,
    handlePhoneSearch,
    handleAddNewPatient,
    handleSelectPatient,
    createNewPatient,
    updateFinalPatientInfo,
    resetAll
  ]);
};
