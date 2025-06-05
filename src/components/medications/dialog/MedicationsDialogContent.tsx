
import * as React from 'react';
import { Medication } from '@/integrations/supabase/schema';
import MedicationsDialogHeader from './MedicationsDialogHeader';
import MedicationsDialogForm from './MedicationsDialogForm';
import { MedicationFormValues } from '../schemas/medicationSchema';

interface MedicationsDialogContentProps {
  medications: Medication[];
  medication: Medication | null;
  isEditing: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addMedication: (data: any) => Promise<any>;
  updateMedication: (id: string, data: any) => Promise<any>;
}

const MedicationsDialogContent: React.FC<MedicationsDialogContentProps> = ({
  medications,
  medication,
  isEditing,
  open,
  onOpenChange,
  addMedication,
  updateMedication,
}) => {
  const handleSubmit = async (values: MedicationFormValues) => {
    try {
      if (isEditing && medication) {
        await updateMedication(medication.id, values);
      } else {
        await addMedication(values);
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving medication:', error);
    }
  };

  return (
    <>
      <MedicationsDialogHeader isEditing={isEditing} medication={medication} />
      <MedicationsDialogForm
        medication={medication}
        medications={medications} 
        isEditing={isEditing}
        open={open}
        onOpenChange={onOpenChange}
        addMedication={addMedication}
        updateMedication={updateMedication}
      />
    </>
  );
};

export default MedicationsDialogContent;
