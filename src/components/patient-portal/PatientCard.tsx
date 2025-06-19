
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Patient, Queue } from '@/integrations/supabase/schema';

interface PatientCardProps {
  patient: Patient;
  queues: Queue[];
  isSelected: boolean;
  isLoading: boolean;
  onSelectPatient: (patient: Patient) => void;
}

const PatientCard: React.FC<PatientCardProps> = ({
  patient,
  queues,
  isSelected,
  isLoading,
  onSelectPatient
}) => {
  return (
    <Button
      variant={isSelected ? "default" : "outline"}
      className="w-full justify-between text-left h-auto p-3"
      onClick={() => onSelectPatient(patient)}
    >
      <div className="flex flex-col items-start">
        <span className="font-medium">{patient.name}</span>
        {patient.phone && (
          <span className="text-sm text-gray-500">{patient.phone}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {isLoading ? (
          <span className="text-sm text-gray-400">กำลังโหลด...</span>
        ) : (
          <Badge variant={queues.length > 0 ? "default" : "secondary"}>
            {queues.length} คิว
          </Badge>
        )}
      </div>
    </Button>
  );
};

export default PatientCard;
