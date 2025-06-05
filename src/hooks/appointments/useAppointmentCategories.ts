
import { useMemo } from 'react';
import { Appointment } from '@/integrations/supabase/schema';

export const useAppointmentCategories = (appointments: Appointment[]) => {
  return useMemo(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayAppointments = appointments.filter(app => 
      new Date(app.date).toDateString() === today.toDateString()
    );
    
    const tomorrowAppointments = appointments.filter(app => 
      new Date(app.date).toDateString() === tomorrow.toDateString()
    );
    
    const upcomingAppointments = appointments.filter(app => 
      new Date(app.date) > tomorrow
    );

    return {
      todayAppointments,
      tomorrowAppointments,
      upcomingAppointments
    };
  }, [appointments]);
};
