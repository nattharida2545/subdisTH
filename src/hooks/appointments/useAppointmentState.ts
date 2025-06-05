
import { useState, useEffect } from 'react';
import { Appointment, AppointmentStatus } from '@/integrations/supabase/schema';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAppointmentState = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('date', { ascending: true });

      if (error) {
        throw error;
      }

      setAppointments((data || []).map(item => ({
        ...item,
        status: item.status as AppointmentStatus
      })));
    } catch (err: any) {
      console.error('Error fetching appointments:', err);
      setError(err.message || 'Failed to fetch appointments');
      toast.error('ไม่สามารถดึงข้อมูลการนัดหมายได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return {
    appointments,
    setAppointments,
    loading,
    error,
    fetchAppointments
  };
};
