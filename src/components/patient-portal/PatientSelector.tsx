
import React from 'react';
import { Patient } from '@/integrations/supabase/schema';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface PatientSelectorProps {
  patients: Patient[];
  selectedPatientId?: string;
  onSelectPatient: (patient: Patient) => void;
}

const PatientSelector: React.FC<PatientSelectorProps> = ({ 
  patients, 
  selectedPatientId, 
  onSelectPatient 
}) => {
  return (
    <RadioGroup 
      defaultValue={selectedPatientId || patients[0]?.id}
      className="space-y-3"
      onValueChange={(value) => {
        const patient = patients.find(p => p.id === value);
        if (patient) {
          onSelectPatient(patient);
        }
      }}
    >
      {patients.map((patient) => (
        <div 
          key={patient.id} 
          className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-gray-50"
        >
          <RadioGroupItem value={patient.id} id={patient.id} />
          <Label 
            htmlFor={patient.id} 
            className="flex-1 cursor-pointer font-normal"
          >
            <div className="flex flex-col">
              <span className="font-medium">{patient.name}</span>
              <span className="text-sm text-gray-500">
                {patient.patient_id} • {patient.phone}
              </span>
            </div>
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
};

export default PatientSelector;
