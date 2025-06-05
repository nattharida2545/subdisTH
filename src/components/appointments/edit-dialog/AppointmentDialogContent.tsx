
import React from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { AppointmentDateTimeFields } from './fields/AppointmentDateTimeFields';
import { AppointmentDetailsFields } from './fields/AppointmentDetailsFields';
import { PatientSearchSection } from '../patient-search/PatientSearchSection';
import { UseFormReturn } from 'react-hook-form';
import { Patient } from '@/integrations/supabase/schema';
import { AppointmentFormValues } from './types';

interface AppointmentDialogContentProps {
  form: UseFormReturn<AppointmentFormValues>;
  onSubmit: (values: AppointmentFormValues) => Promise<void>;
  onOpenChange: (open: boolean) => void;
  selectedPatientId?: string;
  onPatientSelect: (patient: Patient) => void;
}

export const AppointmentDialogContent = ({
  form,
  onSubmit,
  onOpenChange,
  selectedPatientId,
  onPatientSelect
}: AppointmentDialogContentProps) => {
  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>แก้ไขการนัดหมาย</DialogTitle>
      </DialogHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <PatientSearchSection 
            onPatientSelect={onPatientSelect}
            selectedPatientId={selectedPatientId}
          />
          
          <AppointmentDateTimeFields form={form} />
          <AppointmentDetailsFields form={form} />
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              ยกเลิก
            </Button>
            <Button type="submit">บันทึก</Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};
