
import * as React from 'react';
import { usePatientSearch } from '../patient/usePatientSearch';
import { toast } from 'sonner';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useQueuePatientSearch');

export interface UseQueuePatientSearchReturn {
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  isSearching: boolean;
  matchedPatients: any[];
  showNewPatientForm: boolean;
  handlePhoneSearch: () => Promise<any[]>;
  resetPatientSearch: () => void;
}

export const useQueuePatientSearch = (): UseQueuePatientSearchReturn => {
  const patientSearch = usePatientSearch();
  const [matchedPatients, setMatchedPatients] = React.useState<any[]>([]);
  
  const { 
    phoneNumber, 
    setPhoneNumber, 
    isSearching, 
    handlePhoneSearch: searchPatientsByPhone,
    setShowNewPatientForm,
    resetPatientSearch
  } = patientSearch;

  // Effects for syncing state with underlying hook
  React.useEffect(() => {
    if (patientSearch.matchedPatients) {
      setMatchedPatients(patientSearch.matchedPatients);
    }
  }, [patientSearch.matchedPatients]);

  // Define all handlers with useCallback
  const handlePhoneSearch = React.useCallback(async () => {
    if (phoneNumber) {
      logger.info('Searching for patients with phone:', phoneNumber);
      const patients = await searchPatientsByPhone();
      if (patients) {
        setMatchedPatients(patients);
      }
      
      if (!patients || patients.length === 0) {
        setShowNewPatientForm(true);
      } else {
        setShowNewPatientForm(false);
      }
      return patients || [];
    } else {
      toast.error('กรุณากรอกเบอร์โทรศัพท์');
      return [];
    }
  }, [phoneNumber, searchPatientsByPhone, setShowNewPatientForm]);

  return React.useMemo(() => ({
    phoneNumber,
    setPhoneNumber,
    isSearching,
    matchedPatients,
    showNewPatientForm: patientSearch.showNewPatientForm,
    handlePhoneSearch,
    resetPatientSearch,
  }), [
    phoneNumber,
    setPhoneNumber,
    isSearching,
    matchedPatients,
    patientSearch.showNewPatientForm,
    handlePhoneSearch,
    resetPatientSearch
  ]);
};
