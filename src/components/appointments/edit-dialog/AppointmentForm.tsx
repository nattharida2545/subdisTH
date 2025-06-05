
import React from 'react';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { UseFormReturn } from 'react-hook-form';
import { Patient } from '@/integrations/supabase/schema';
import { AppointmentFormValues } from './types';
import { AppointmentPatientField } from './fields/AppointmentPatientField';
import { AppointmentDateTimeFields } from './fields/AppointmentDateTimeFields';
import { AppointmentDetailsFields } from './fields/AppointmentDetailsFields';
import { AppointmentStatusField } from '../common/AppointmentStatusField';

interface AppointmentFormProps {
  form: UseFormReturn<AppointmentFormValues>;
  onSubmit: (values: AppointmentFormValues) => Promise<void>;
  onCancel: () => void;
  onPatientSelect: (patient: Patient) => void;
}

export const AppointmentForm: React.FC<AppointmentFormProps> = ({
  form,
  onSubmit,
  onCancel,
  onPatientSelect,
}) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <AppointmentPatientField 
          form={form}
          onPatientSelect={onPatientSelect}
        />
        
        <AppointmentDateTimeFields form={form} />
        <AppointmentDetailsFields form={form} />
        <AppointmentStatusField form={form} />
        
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
