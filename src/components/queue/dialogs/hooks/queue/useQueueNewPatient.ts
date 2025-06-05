
import * as React from 'react';
import { useNewPatientCreation } from '../patient/useNewPatientCreation';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useQueueNewPatient');

export interface UseQueueNewPatientReturn {
  showNewPatientForm: boolean;
  setShowNewPatientForm: (show: boolean) => void;
  createNewPatient: ReturnType<typeof useNewPatientCreation>['createNewPatient'];
  handleAddNewPatient: () => void;
}

export const useQueueNewPatient = (
  setLocalShowNewPatientForm: (show: boolean) => void,
  setPatientId: (id: string) => void
): UseQueueNewPatientReturn => {
  const patientCreation = useNewPatientCreation();
  
  const {
    showNewPatientForm,
    setShowNewPatientForm,
    createNewPatient,
  } = patientCreation;

  React.useEffect(() => {
    setLocalShowNewPatientForm(showNewPatientForm);
  }, [showNewPatientForm, setLocalShowNewPatientForm]);

  const handleAddNewPatient = React.useCallback(() => {
    logger.debug('Adding new patient form');
    setLocalShowNewPatientForm(true);
    setShowNewPatientForm(true);
    setPatientId('');
  }, [setShowNewPatientForm, setPatientId, setLocalShowNewPatientForm]);

  return React.useMemo(() => ({
    showNewPatientForm,
    setShowNewPatientForm,
    createNewPatient,
    handleAddNewPatient,
  }), [
    showNewPatientForm,
    setShowNewPatientForm,
    createNewPatient,
    handleAddNewPatient,
  ]);
};
