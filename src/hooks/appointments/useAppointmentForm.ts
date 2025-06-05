
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Appointment } from '@/integrations/supabase/schema';
import { appointmentFormSchema } from '@/components/appointments/edit-dialog/schema';
import { AppointmentFormValues } from '@/components/appointments/edit-dialog/types';

export const useAppointmentForm = (appointment: Appointment | null) => {
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      patient_id: '',
      date: '',
      time: '',
      purpose: '',
      notes: '',
      status: 'SCHEDULED',
    },
  });

  useEffect(() => {
    if (appointment) {
      const appointmentDate = new Date(appointment.date);
      form.reset({
        patient_id: appointment.patient_id,
        date: format(appointmentDate, 'yyyy-MM-dd'),
        time: format(appointmentDate, 'HH:mm'),
        purpose: appointment.purpose,
        notes: appointment.notes || '',
        status: appointment.status,
      });
    }
  }, [appointment, form]);

  return form;
};
