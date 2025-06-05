
import { useState } from 'react';
import { format, parse, addMinutes } from 'date-fns';
import { Patient } from '@/integrations/supabase/schema';

interface TimeSlot {
  patientId: string;
  time: string;
  patientName?: string;
}

export const useTimeSlotCalculation = () => {
  const [slots, setSlots] = useState<TimeSlot[]>([]);

  const calculateTimeSlots = (
    startTime: string,
    patients: Patient[],
    durationMinutes: number,
    bufferMinutes: number = 5
  ) => {
    if (!startTime || patients.length === 0) {
      return [];
    }

    try {
      // Parse the start time
      const timeFormat = 'HH:mm';
      let currentTime = parse(startTime, timeFormat, new Date());
      const totalDuration = durationMinutes + bufferMinutes;

      // Generate time slots for each patient
      const newSlots: TimeSlot[] = patients.map((patient, index) => {
        // For the first patient, use the exact start time
        if (index > 0) {
          // For subsequent patients, add the total duration
          currentTime = addMinutes(currentTime, totalDuration);
        }
        
        return {
          patientId: patient.id,
          time: format(currentTime, timeFormat),
          patientName: patient.name
        };
      });

      setSlots(newSlots);
      return newSlots;
    } catch (error) {
      console.error('Error calculating time slots:', error);
      return [];
    }
  };

  return { slots, calculateTimeSlots };
};
