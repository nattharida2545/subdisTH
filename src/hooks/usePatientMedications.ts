
import * as React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { createLogger } from '@/utils/logger';
import { queueSupabaseRequest } from '@/utils/requestThrottler';
import { Medication } from '@/integrations/supabase/schema';

const logger = createLogger('usePatientMedications');

export interface PatientMedication {
  id: string;
  patient_id: string;
  medication_id: string;
  dosage: string;
  instructions?: string;
  start_date: string;
  end_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  medication?: Medication; // Joined medication data
}

export const usePatientMedications = (patientId?: string) => {
  const [medications, setMedications] = React.useState<PatientMedication[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Check if a medication combination already exists
  const checkDuplicateMedication = React.useCallback(async (
    patientId: string,
    medicationId: string,
    dosage: string,
    startDate: string
  ): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('patient_medications')
        .select('id')
        .eq('patient_id', patientId)
        .eq('medication_id', medicationId)
        .eq('dosage', dosage)
        .eq('start_date', startDate)
        .limit(1);

      if (error) {
        logger.error('Error checking duplicate medication:', error);
        return false;
      }

      return (data && data.length > 0);
    } catch (err) {
      logger.error('Error in duplicate check:', err);
      return false;
    }
  }, []);

  // Fetch patient medication history
  const fetchMedicationHistory = React.useCallback(async (pid?: string) => {
    if (!pid) {
      setMedications([]);
      setLoading(false);
      return [];
    }

    try {
      setLoading(true);
      setError(null);
      logger.info(`Fetching medication history for patient ${pid}`);

      const result = await queueSupabaseRequest(async () => {
        const response = await supabase
          .from('patient_medications')
          .select(`
            *,
            medication:medications(*)
          `)
          .eq('patient_id', pid)
          .order('created_at', { ascending: false });
        return response;
      });

      if (result.error) {
        throw result.error;
      }

      const medicationHistory = result.data || [];
      logger.info(`Fetched ${medicationHistory.length} medication records`);
      setMedications(medicationHistory);
      return medicationHistory;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch medication history';
      logger.error('Error fetching medication history:', err);
      setError(errorMessage);
      toast.error('ไม่สามารถดึงข้อมูลประวัติการรับยาได้');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Add new medication to patient's history with duplicate checking
  const addMedication = async (medicationData: Omit<PatientMedication, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null);
      logger.info(`Adding medication for patient ${medicationData.patient_id}`);

      // Check for duplicates before attempting to insert
      const isDuplicate = await checkDuplicateMedication(
        medicationData.patient_id,
        medicationData.medication_id,
        medicationData.dosage,
        medicationData.start_date
      );

      if (isDuplicate) {
        const errorMessage = 'ยาและขนาดยานี้ได้จ่ายไปแล้วในวันเดียวกัน';
        toast.error(errorMessage);
        setError(errorMessage);
        return null;
      }

      const { data, error } = await supabase
        .from('patient_medications')
        .insert(medicationData)
        .select(`*, medication:medications(*)`);

      if (error) {
        // Handle unique constraint violation specifically
        if (error.code === '23505' && error.message.includes('unique_patient_medication_per_day')) {
          const errorMessage = 'ยาและขนาดยานี้ได้จ่ายไปแล้วในวันเดียวกัน';
          toast.error(errorMessage);
          setError(errorMessage);
          return null;
        }
        throw error;
      }

      if (data && data.length > 0) {
        setMedications(prev => [data[0], ...prev]);
        return data[0];
      }
      return null;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add medication';
      logger.error('Error adding medication:', err);
      setError(errorMessage);
      toast.error('ไม่สามารถบันทึกข้อมูลการจ่ายยาได้');
      return null;
    }
  };

  // Update existing medication
  const updateMedication = async (id: string, medicationData: Partial<PatientMedication>) => {
    try {
      setError(null);
      logger.info(`Updating medication record ${id}`);

      const { data, error } = await supabase
        .from('patient_medications')
        .update(medicationData)
        .eq('id', id)
        .select(`*, medication:medications(*)`);

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setMedications(prev => 
          prev.map(med => med.id === id ? data[0] : med)
        );
        return data[0];
      }
      return null;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update medication';
      logger.error('Error updating medication:', err);
      setError(errorMessage);
      toast.error('ไม่สามารถอัปเดตข้อมูลการจ่ายยาได้');
      return null;
    }
  };

  // Delete medication from history
  const deleteMedication = async (id: string) => {
    try {
      setError(null);
      logger.info(`Deleting medication record ${id}`);

      const { error } = await supabase
        .from('patient_medications')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setMedications(prev => prev.filter(med => med.id !== id));
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete medication';
      logger.error('Error deleting medication:', err);
      setError(errorMessage);
      toast.error('ไม่สามารถลบข้อมูลการจ่ายยาได้');
      return false;
    }
  };

  // Initial fetch when patientId is provided
  React.useEffect(() => {
    if (patientId) {
      fetchMedicationHistory(patientId);
    } else {
      setMedications([]);
      setLoading(false);
    }
  }, [patientId, fetchMedicationHistory]);

  return {
    medications,
    loading,
    error,
    fetchMedicationHistory,
    addMedication,
    updateMedication,
    deleteMedication,
    checkDuplicateMedication
  };
};
