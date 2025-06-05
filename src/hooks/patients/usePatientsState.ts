
import { useState, useEffect } from 'react';
import { Patient } from '@/integrations/supabase/schema';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const usePatientsState = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setPatients(data as Patient[]);
      console.info('Fetched', data?.length, 'patients from database');
    } catch (err: any) {
      console.error('Error fetching patients:', err);
      setError(err.message || 'Failed to fetch patients');
      toast.error('ไม่สามารถดึงข้อมูลผู้ป่วยได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  return {
    patients,
    setPatients,
    loading,
    error,
    fetchPatients
  };
};
