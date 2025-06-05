
import * as React from 'react';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Medication } from '@/integrations/supabase/schema';

export interface MedicationsDialogHeaderProps {
  isEditing: boolean;
  medication: Medication | null;
}

const MedicationsDialogHeader: React.FC<MedicationsDialogHeaderProps> = ({ isEditing, medication }) => (
  <DialogHeader>
    <DialogTitle>
      {isEditing ? 'แก้ไขรายการยา' : 'เพิ่มรายการยาใหม่'}
    </DialogTitle>
  </DialogHeader>
);

export default MedicationsDialogHeader;
