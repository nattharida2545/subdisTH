
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PatientForm from '@/components/patients/PatientForm';
import { Patient } from '@/integrations/supabase/schema';

interface PatientFormCardProps {
  patient: Patient | null;
  onSubmit: (patient: Partial<Patient>) => void;
  onCancel: () => void;
}

const PatientFormCard: React.FC<PatientFormCardProps> = ({ 
  patient, 
  onSubmit, 
  onCancel 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{patient ? 'แก้ไขข้อมูลผู้ป่วย' : 'เพิ่มข้อมูลผู้ป่วยใหม่'}</CardTitle>
      </CardHeader>
      <CardContent>
        <PatientForm 
          patient={patient || undefined}
          onSubmit={onSubmit} 
          onCancel={onCancel}
        />
      </CardContent>
    </Card>
  );
};

export default PatientFormCard;
