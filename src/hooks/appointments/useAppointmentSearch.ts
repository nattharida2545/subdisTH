
import { useState, useEffect } from 'react';
import { Appointment } from '@/integrations/supabase/schema';

export interface AppointmentSearchParams {
  patientName?: string;
  patientPhone?: string;
  dateRange?: {
    from: Date | undefined;
    to: Date | undefined;
  };
}

export const useAppointmentSearch = (appointments: Appointment[], patients: any[]) => {
  const [searchParams, setSearchParams] = useState<AppointmentSearchParams>({});
  const [searchResults, setSearchResults] = useState<Appointment[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Function to update search parameters
  const updateSearchParams = (params: Partial<AppointmentSearchParams>) => {
    setSearchParams(prev => ({
      ...prev,
      ...params
    }));
  };

  // Clear all search parameters
  const clearSearch = () => {
    setSearchParams({});
    setSearchResults([]);
    setIsSearching(false);
  };

  // Calculate if we're actively filtering
  const isFiltered = !!(
    searchParams.patientName || 
    searchParams.patientPhone || 
    searchParams.dateRange?.from
  );

  // Perform the search whenever parameters or data change
  useEffect(() => {
    if (!isFiltered) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    const filtered = appointments.filter(appointment => {
      const patient = patients.find(p => p.id === appointment.patient_id);
      const appointmentDate = new Date(appointment.date);
      
      // Patient name match
      const nameMatch = !searchParams.patientName || 
        (patient && patient.name.toLowerCase().includes(searchParams.patientName.toLowerCase()));
      
      // Phone match
      const phoneMatch = !searchParams.patientPhone || 
        (patient && patient.phone.includes(searchParams.patientPhone));
      
      // Date range match
      let dateMatch = true;
      if (searchParams.dateRange?.from) {
        const startDate = new Date(searchParams.dateRange.from);
        startDate.setHours(0, 0, 0, 0);
        dateMatch = appointmentDate >= startDate;
        
        if (dateMatch && searchParams.dateRange.to) {
          const endDate = new Date(searchParams.dateRange.to);
          endDate.setHours(23, 59, 59, 999);
          dateMatch = appointmentDate <= endDate;
        }
      }
      
      return nameMatch && phoneMatch && dateMatch;
    });
    
    setSearchResults(filtered);
  }, [searchParams, appointments, patients, isFiltered]);

  return {
    searchParams,
    updateSearchParams,
    clearSearch,
    searchResults,
    isSearching,
    isFiltered
  };
};
