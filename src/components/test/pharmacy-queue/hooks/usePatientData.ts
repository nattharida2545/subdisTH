
import { useMemo } from 'react';
import { Patient } from '@/integrations/supabase/schema';

interface UsePatientDataProps {
  patients: Patient[];
}

export const usePatientData = ({ patients }: UsePatientDataProps) => {
  // Ensure we have a safe array to work with
  const safePatients = Array.isArray(patients) ? patients : [];

  const getPatientName = useMemo(() => {
    return (patientId: string): string => {
      if (!patientId || !Array.isArray(safePatients)) return 'ไม่ทราบชื่อ';
      
      const patient = safePatients.find(p => p && p.id === patientId);
      return patient?.name || 'ไม่ทราบชื่อ';
    };
  }, [safePatients]);

  const getPatientData = useMemo(() => {
    return (patientId: string): Patient | null => {
      if (!patientId || !Array.isArray(safePatients)) return null;
      
      return safePatients.find(p => p && p.id === patientId) || null;
    };
  }, [safePatients]);

  return {
    getPatientName,
    getPatientData
  };
};
