
import * as React from 'react';
import { usePatientSelection } from '../patient/usePatientSelection';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useQueuePatientSelection');

export interface UseQueuePatientSelectionReturn {
  patientId: string;
  setPatientId: (id: string) => void;
  newPatientName: string;
  setNewPatientName: (name: string) => void;
  selectedPatientName: string;
  selectedPatientPhone: string;
  selectedPatientLineId: string;
  finalPatientName: string;
  finalPatientPhone: string;
  finalPatientLineId: string;
  handleSelectPatient: (id: string) => void;
  updateFinalPatientInfo: () => void;
  resetPatientSelection: () => void;
}

export const useQueuePatientSelection = (matchedPatients: any[]): UseQueuePatientSelectionReturn => {
  const patientSelection = usePatientSelection();
  
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
    handleSelectPatient: selectPatientFromList,
    updateFinalPatientInfo,
    resetPatientSelection
  } = patientSelection;

  const handleSelectPatient = React.useCallback((id: string) => {
    logger.debug(`Selecting patient with ID: ${id}`);
    setPatientId(id);
    selectPatientFromList(id, matchedPatients);
  }, [matchedPatients, selectPatientFromList, setPatientId]);

  return React.useMemo(() => ({
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
  }), [
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
  ]);
};
