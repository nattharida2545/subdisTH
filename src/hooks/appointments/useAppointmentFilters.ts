
import { useState, useEffect } from 'react';
import { Appointment, Patient } from '@/integrations/supabase/schema';

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

export const useAppointmentFilters = (appointments: Appointment[], patients: Patient[]) => {
  const [nameSearchTerm, setNameSearchTerm] = useState('');
  const [phoneSearchTerm, setPhoneSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined
  });
  
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  
  const isFiltered = !!nameSearchTerm || !!phoneSearchTerm || !!dateRange.from;

  useEffect(() => {
    if (!isFiltered) {
      setFilteredAppointments([]);
      return;
    }

    const filtered = appointments.filter(appointment => {
      const patient = patients.find(p => p.id === appointment.patient_id);
      const appointmentDate = new Date(appointment.date);
      
      const nameMatch = !nameSearchTerm || 
        (patient && patient.name.toLowerCase().includes(nameSearchTerm.toLowerCase()));
      
      const phoneMatch = !phoneSearchTerm || 
        (patient && patient.phone.includes(phoneSearchTerm));
      
      let dateMatch = true;
      if (dateRange.from) {
        dateRange.from.setHours(0, 0, 0, 0);
        dateMatch = appointmentDate >= dateRange.from;
        
        if (dateMatch && dateRange.to) {
          const endDate = new Date(dateRange.to);
          endDate.setHours(23, 59, 59, 999);
          dateMatch = appointmentDate <= endDate;
        }
      }
      
      return nameMatch && phoneMatch && dateMatch;
    });
    
    setFilteredAppointments(filtered);
  }, [nameSearchTerm, phoneSearchTerm, dateRange, appointments, patients, isFiltered]);

  const handleClearSearch = () => {
    setNameSearchTerm('');
    setPhoneSearchTerm('');
    setDateRange({ from: undefined, to: undefined });
  };

  return {
    nameSearchTerm,
    setNameSearchTerm,
    phoneSearchTerm,
    setPhoneSearchTerm,
    dateRange,
    setDateRange,
    filteredAppointments,
    isFiltered,
    handleClearSearch
  };
};
