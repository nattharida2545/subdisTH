
import { Patient } from '@/integrations/supabase/schema';

export const getPatientInfo = (patients: Patient[]) => {
  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? patient.name : 'ไม่ระบุชื่อ';
  };

  const getPatientPhone = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? patient.phone : '';
  };

  return { getPatientName, getPatientPhone };
};
