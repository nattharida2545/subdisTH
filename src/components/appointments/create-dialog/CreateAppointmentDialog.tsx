
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AppointmentStatus } from '@/integrations/supabase/schema';
import { CreateAppointmentFormValues } from './types';
import { useAppointments } from '@/hooks/appointments/useAppointments';
import { CreateAppointmentForm } from './CreateAppointmentForm';

interface CreateAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateAppointmentDialog = ({
  open,
  onOpenChange,
}: CreateAppointmentDialogProps) => {
  const { addAppointment } = useAppointments();

  const handleSubmit = async (values: CreateAppointmentFormValues) => {
    const { date, time, ...rest } = values;
    
    // Combine date and time into a single ISO string
    const combinedDate = new Date(`${date}T${time}`);
    
    const appointment = await addAppointment({
      ...rest,
      date: combinedDate.toISOString(),
      status: 'SCHEDULED' as AppointmentStatus,
    });
    
    if (appointment) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>เพิ่มการนัดหมายใหม่</DialogTitle>
        </DialogHeader>
        
        <CreateAppointmentForm
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
