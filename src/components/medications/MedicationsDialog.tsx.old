
import * as React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import MedicationsDialogController from './MedicationsDialogController';
import { Medication } from '@/integrations/supabase/schema';

// Debug log for React
console.log("[MedicationsDialog] React instance:", React);

interface MedicationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medication: Medication | null;
  medications: Medication[];
  addMedication: (data: any) => Promise<any>;
  updateMedication: (id: string, data: any) => Promise<any>;
}

const MedicationsDialog: React.FC<MedicationsDialogProps> = ({
  open,
  onOpenChange,
  medication,
  medications,
  addMedication,
  updateMedication
}) => {
  const isEditing = !!medication;
  
  // Add debug log
  console.log("MedicationsDialog rendered with open:", open);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <MedicationsDialogController
          medications={medications}
          medication={medication}
          isEditing={isEditing}
          open={open}
          onOpenChange={onOpenChange}
          addMedication={addMedication}
          updateMedication={updateMedication}
        />
      </DialogContent>
    </Dialog>
  );
};

export default MedicationsDialog;
