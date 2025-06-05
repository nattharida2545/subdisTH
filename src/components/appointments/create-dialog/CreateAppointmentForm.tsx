
import React from 'react';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Patient } from '@/integrations/supabase/schema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateAppointmentFormValues } from './types';
import { createAppointmentFormSchema } from './schema';
import { AppointmentPatientField } from './fields/AppointmentPatientField';
import { AppointmentDateTimeFields } from './fields/AppointmentDateTimeFields';
import { AppointmentDetailsFields } from './fields/AppointmentDetailsFields';

interface CreateAppointmentFormProps {
  onSubmit: (values: CreateAppointmentFormValues) => Promise<void>;
  onCancel: () => void;
}

export const CreateAppointmentForm: React.FC<CreateAppointmentFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  const form = useForm<CreateAppointmentFormValues>({
    resolver: zodResolver(createAppointmentFormSchema),
    defaultValues: {
      patient_id: '',
      date: '',
      time: '',
      purpose: '',
      notes: '',
    },
  });

  const handlePatientSelect = (patient: Patient) => {
    form.setValue('patient_id', patient.id);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <AppointmentPatientField
          form={form}
          onPatientSelect={handlePatientSelect}
        />
        
        <AppointmentDateTimeFields form={form} />
        <AppointmentDetailsFields form={form} />
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            ยกเลิก
          </Button>
          <Button type="submit">บันทึก</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
