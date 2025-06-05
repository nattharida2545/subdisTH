
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import PatientList from '@/components/patients/PatientList';
import { Patient } from '@/integrations/supabase/schema';

interface PatientListContainerProps {
  patients: Patient[];
  loading: boolean;
  error: string | null;
  onSelectPatient: (patient: Patient) => void;
  onEditPatient: (patient: Patient) => void;
}

const PatientListContainer: React.FC<PatientListContainerProps> = ({
  patients,
  loading,
  error,
  onSelectPatient,
  onEditPatient
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            <p>เกิดข้อผิดพลาด: {error}</p>
          </div>
        ) : (
          <PatientList 
            patients={patients} 
            onSelectPatient={onSelectPatient}
            onEditPatient={onEditPatient}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default PatientListContainer;
