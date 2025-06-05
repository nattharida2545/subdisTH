
import * as React from 'react';
import { toast } from 'sonner';
import { Patient } from '@/integrations/supabase/schema';
import { supabase } from '@/integrations/supabase/client';
import { createLogger } from '@/utils/logger';
import { PatientSearchState, PatientSearchActions } from './types';

const logger = createLogger('usePatientSearch');

export const usePatientSearch = (): PatientSearchState & PatientSearchActions => {
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [isSearching, setIsSearching] = React.useState(false);
  const [matchedPatients, setMatchedPatients] = React.useState<Patient[]>([]);
  const [showNewPatientForm, setShowNewPatientForm] = React.useState(false);
  
  const resetPatientSearch = React.useCallback(() => {
    logger.debug('Resetting patient search state');
    setPhoneNumber('');
    setIsSearching(false);
    setMatchedPatients([]);
    setShowNewPatientForm(false);
  }, []);

  const handlePhoneSearch = React.useCallback(async () => {
    logger.debug(`Starting phone search for: "${phoneNumber}"`);
    
    if (!phoneNumber) {
      logger.warn('Phone number is empty, showing error toast');
      toast.error('กรุณากรอกเบอร์โทรศัพท์');
      return [];
    }

    setIsSearching(true);
    logger.debug('Setting isSearching to true');
    
    try {
      logger.debug('Making Supabase request to search for patients');
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .ilike('phone', `%${phoneNumber}%`);
        
      if (error) {
        logger.error('Supabase error:', error);
        throw error;
      }
      
      const patients = data || [];
      logger.info(`Found ${patients.length} patients with phone number containing "${phoneNumber}"`);
      setMatchedPatients(patients);
      
      if (patients.length === 0) {
        logger.debug('No patients found, showing new patient form');
        setShowNewPatientForm(true);
      } else {
        logger.debug('Patients found, hiding new patient form');
        setShowNewPatientForm(false);
      }
      
      return patients;
    } catch (err: any) {
      logger.error('Error searching for patients:', err);
      toast.error('ไม่สามารถค้นหาข้อมูลผู้ป่วยได้');
      return [];
    } finally {
      logger.debug('Search completed, setting isSearching to false');
      setIsSearching(false);
    }
  }, [phoneNumber]);

  return {
    phoneNumber,
    setPhoneNumber,
    isSearching,
    matchedPatients,
    showNewPatientForm,
    setShowNewPatientForm,
    handlePhoneSearch,
    resetPatientSearch
  };
};
