
import React from 'react';
import { Button } from '@/components/ui/button';
import { Patient } from '@/integrations/supabase/schema';

interface PatientResultsListProps {
  matchedPatients: Patient[];
  patientId: string | null;
  handleSelectPatient: (id: string) => void;
  handleAddNewPatient: () => void;
}

const PatientResultsList: React.FC<PatientResultsListProps> = ({
  matchedPatients,
  patientId,
  handleSelectPatient,
  handleAddNewPatient
}) => {
  if (!matchedPatients || matchedPatients.length === 0) {
    return null;
  }

  return (
    <div className="border rounded-md p-4">
      <h3 className="text-sm font-medium mb-2">ผลการค้นหา ({matchedPatients.length} รายการ)</h3>
      <div className="space-y-2">
        {matchedPatients.map((patient) => (
          <div 
            key={patient.id}
            className={`flex items-center justify-between p-2 rounded-md ${
              patientId === patient.id 
                ? 'bg-pharmacy-100 border border-pharmacy-400' 
                : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <div>
              <p className="font-medium">{patient.name}</p>
              <p className="text-xs text-gray-500">
                {patient.phone}
                {patient.patient_id && ` • รหัส: ${patient.patient_id}`}
              </p>
            </div>
            <Button
              size="sm"
              variant={patientId === patient.id ? "outline" : "default"}
              className={patientId === patient.id ? "border-pharmacy-400 text-gray-700" : ""}
              onClick={() => handleSelectPatient(patient.id)}
            >
              {patientId === patient.id ? 'เลือกแล้ว' : 'เลือก'}
            </Button>
          </div>
        ))}
      </div>
      <div className="mt-4 text-center">
        <Button 
          variant="link" 
          className="text-pharmacy-600"
          onClick={handleAddNewPatient}
        >
          เพิ่มผู้ป่วยใหม่
        </Button>
      </div>
    </div>
  );
};

export default PatientResultsList;
