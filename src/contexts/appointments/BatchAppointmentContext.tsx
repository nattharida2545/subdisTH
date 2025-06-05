
import React, { createContext, useContext, useState } from 'react';
import { Patient } from '@/integrations/supabase/schema';

interface TimeSlot {
  patientId: string;
  time: string;
}

interface BatchAppointmentContextType {
  selectedPatients: Patient[];
  timeSlots: TimeSlot[];
  date: string;
  purpose: string;
  notes: string;
  appointmentDuration: number;
  addPatient: (patient: Patient) => void;
  removePatient: (patientId: string) => void;
  setSelectedPatients: (patients: Patient[]) => void;
  setTimeSlots: (slots: TimeSlot[]) => void;
  setDate: (date: string) => void;
  setPurpose: (purpose: string) => void;
  setNotes: (notes: string) => void;
  setAppointmentDuration: (minutes: number) => void;
  clearAll: () => void;
  movePatient: (fromIndex: number, toIndex: number) => void;
}

const BatchAppointmentContext = createContext<BatchAppointmentContextType | undefined>(undefined);

export const BatchAppointmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedPatients, setSelectedPatients] = useState<Patient[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [date, setDate] = useState<string>('');
  const [purpose, setPurpose] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [appointmentDuration, setAppointmentDuration] = useState<number>(15); // Default 15 minutes

  const addPatient = (patient: Patient) => {
    // Prevent adding duplicates
    if (!selectedPatients.some(p => p.id === patient.id)) {
      setSelectedPatients([...selectedPatients, patient]);
    }
  };

  const removePatient = (patientId: string) => {
    setSelectedPatients(selectedPatients.filter(p => p.id !== patientId));
  };

  const clearAll = () => {
    setSelectedPatients([]);
    setTimeSlots([]);
    setDate('');
    setPurpose('');
    setNotes('');
  };

  // Function to reorder patients (for drag and drop)
  const movePatient = (fromIndex: number, toIndex: number) => {
    const updatedPatients = [...selectedPatients];
    const [movedPatient] = updatedPatients.splice(fromIndex, 1);
    updatedPatients.splice(toIndex, 0, movedPatient);
    setSelectedPatients(updatedPatients);
  };

  return (
    <BatchAppointmentContext.Provider
      value={{
        selectedPatients,
        timeSlots,
        date,
        purpose,
        notes,
        appointmentDuration,
        addPatient,
        removePatient,
        setSelectedPatients,
        setTimeSlots,
        setDate,
        setPurpose,
        setNotes,
        setAppointmentDuration,
        clearAll,
        movePatient,
      }}
    >
      {children}
    </BatchAppointmentContext.Provider>
  );
};

export const useBatchAppointment = (): BatchAppointmentContextType => {
  const context = useContext(BatchAppointmentContext);
  if (context === undefined) {
    throw new Error('useBatchAppointment must be used within a BatchAppointmentProvider');
  }
  return context;
};
