
import * as React from 'react';
import { Medication } from '@/integrations/supabase/schema';
import MedicationsDialogHeader from './MedicationsDialogHeader';
import MedicationsDialogForm from './MedicationsDialogForm';
import { DialogDescription } from '@/components/ui/dialog';

interface MedicationsDialogControllerProps {
  medications: Medication[];
  medication: Medication | null;
  isEditing: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addMedication: (data: any) => Promise<any>;
  updateMedication: (id: string, data: any) => Promise<any>;
}

const MedicationsDialogController: React.FC<MedicationsDialogControllerProps> = ({
  medications = [],
  medication,
  isEditing,
  open,
  onOpenChange,
  addMedication,
  updateMedication
}) => {
  return (
    <>
      <MedicationsDialogHeader isEditing={isEditing} medication={medication} />
      <DialogDescription className="text-sm text-gray-500">
        {isEditing 
          ? `แก้ไขข้อมูลยา ${medication?.name || ''}`
          : 'กรอกข้อมูลยาและเวชภัณฑ์เพื่อเพิ่มในระบบ'}
      </DialogDescription>
      
      <MedicationsDialogForm
        medication={medication}
        isEditing={isEditing}
        medications={medications || []}
        open={open}
        onOpenChange={onOpenChange}
        addMedication={addMedication}
        updateMedication={updateMedication}
      />
    </>
  );
};

export default MedicationsDialogController;
