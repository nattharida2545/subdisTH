
import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { X } from 'lucide-react';
import { Medication } from '@/integrations/supabase/schema';

export interface PendingMedication {
  medication: Medication;
  dosage: string;
  instructions?: string;
}

interface PendingMedicationsListProps {
  medications: PendingMedication[];
  onRemoveMedication: (index: number) => void;
}

const PendingMedicationsList: React.FC<PendingMedicationsListProps> = ({
  medications,
  onRemoveMedication
}) => {
  if (medications.length === 0) {
    return null;
  }

  return (
    <>
      <Separator />
      
      <div>
        <h3 className="font-medium mb-2">รายการยาที่เตรียมจ่าย ({medications.length} รายการ)</h3>
        <ul className="space-y-2">
          {medications.map((med, index) => (
            <li key={index} className="flex items-center justify-between bg-blue-50 p-3 rounded-md border border-blue-200">
              <div className="flex-1">
                <div className="font-medium text-blue-900">{med.medication.name}</div>
                <div className="text-sm text-blue-700">
                  ขนาดยา: {med.dosage}
                  {med.instructions && ` | ${med.instructions}`}
                </div>
                <div className="text-xs text-blue-600">
                  รหัส: {med.medication.code} | คงเหลือ: {med.medication.stock} {med.medication.unit}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveMedication(index)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default PendingMedicationsList;
