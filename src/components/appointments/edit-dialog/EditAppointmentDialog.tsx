
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Appointment, Patient } from '@/integrations/supabase/schema';
import { AppointmentFormValues } from './types';
import { AppointmentForm } from './AppointmentForm';
import { useAppointmentForm } from '@/hooks/appointments/useAppointmentForm';
import { toast } from 'sonner';

interface EditAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
  patients: Patient[];
  onSubmit: (values: AppointmentFormValues) => Promise<void>;
}

const EditAppointmentDialog = ({
  open,
  onOpenChange,
  appointment,
  patients,
  onSubmit,
}: EditAppointmentDialogProps) => {
  const form = useAppointmentForm(appointment);

  const handlePatientSelect = (patient: Patient) => {
    form.setValue('patient_id', patient.id);
  };
  
  const handleFormSubmit = async (values: AppointmentFormValues) => {
    try {
      await onSubmit(values);
      toast.success('บันทึกการนัดหมายเรียบร้อยแล้ว');
    } catch (error) {
      console.error('Error submitting appointment form:', error);
      toast.error('เกิดข้อผิดพลาดในการบันทึกการนัดหมาย');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>แก้ไขการนัดหมาย</DialogTitle>
        </DialogHeader>
        
        <AppointmentForm
          form={form}
          onSubmit={handleFormSubmit}
          onCancel={() => onOpenChange(false)}
          onPatientSelect={handlePatientSelect}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditAppointmentDialog;
