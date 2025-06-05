
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface NewPatientFormProps {
  newPatientName: string;
  setNewPatientName: (value: string) => void;
  showNewPatientForm: boolean;
}

const NewPatientForm: React.FC<NewPatientFormProps> = ({
  newPatientName,
  setNewPatientName,
  showNewPatientForm
}) => {
  if (!showNewPatientForm) {
    return null;
  }

  return (
    <div className="grid gap-2">
      <Label htmlFor="newPatientName">ชื่อ-นามสกุล (ผู้ป่วยใหม่)</Label>
      <Input
        id="newPatientName"
        value={newPatientName}
        onChange={(e) => setNewPatientName(e.target.value)}
        placeholder="กรอกชื่อ-นามสกุลผู้ป่วยใหม่"
      />
      <div id="newPatientForm" data-show={showNewPatientForm.toString()}></div>
    </div>
  );
};

export default NewPatientForm;
