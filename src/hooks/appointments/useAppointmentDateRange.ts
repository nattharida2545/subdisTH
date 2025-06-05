
import { useMemo } from 'react';
import { Appointment } from '@/integrations/supabase/schema';
import { toast } from 'sonner';
import { isWithinInterval, parseISO } from 'date-fns';

export const useAppointmentDateRange = () => {
  const getAppointmentsByDateRange = useMemo(() => (
    appointments: Appointment[], 
    startDate?: Date, 
    endDate?: Date
  ) => {
    try {
      if (!startDate || !endDate) {
        return appointments;
      }

      return appointments.filter(appointment => {
        try {
          const appointmentDate = parseISO(appointment.date);
          return isWithinInterval(appointmentDate, { 
            start: startDate, 
            end: endDate 
          });
        } catch (err) {
          console.error('Error parsing date:', appointment.date, err);
          return false;
        }
      });
    } catch (err) {
      console.error('Error filtering appointments by date range:', err);
      toast.error('ไม่สามารถกรองการนัดหมายตามช่วงวันที่ได้');
      return [];
    }
  }, []);

  return {
    getAppointmentsByDateRange
  };
};
