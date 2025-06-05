
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BatchAppointmentForm } from './BatchAppointmentForm';

interface BatchAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BatchAppointmentDialog: React.FC<BatchAppointmentDialogProps> = ({
  open,
  onOpenChange
}) => {
  const handleSuccess = () => {
    onOpenChange(false);
  };
  
  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>สร้างนัดหมายแบบกลุ่ม</DialogTitle>
        </DialogHeader>
        
        <BatchAppointmentForm
          onCancel={handleCancel}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
};
