
import React from 'react';
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { PatientSearchSection } from '../../patient-search/PatientSearchSection';
import { Patient } from '@/integrations/supabase/schema';
import { UseFormReturn } from 'react-hook-form';
import { AppointmentFormValues } from '../types';

interface AppointmentPatientFieldProps {
  form: UseFormReturn<AppointmentFormValues>;
  onPatientSelect: (patient: Patient) => void;
}

export const AppointmentPatientField: React.FC<AppointmentPatientFieldProps> = ({
  form,
  onPatientSelect,
}) => {
  return (
    <FormField
      control={form.control}
      name="patient_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>ผู้ป่วย</FormLabel>
          <PatientSearchSection 
            onPatientSelect={onPatientSelect}
            selectedPatientId={field.value}
          />
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
