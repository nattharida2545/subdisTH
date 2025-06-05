
import React from 'react';
import { Separator } from '@/components/ui/separator';
import { PatientMedication } from '@/hooks/usePatientMedications';
import { Medication } from '@/integrations/supabase/schema';

interface DispensedMedicationsListProps {
  medications: PatientMedication[];
  allMedications: Medication[];
}

const DispensedMedicationsList: React.FC<DispensedMedicationsListProps> = ({
  medications,
  allMedications
}) => {
  if (medications.length === 0) {
    return null;
  }

  const getMedicationName = (medicationId: string) => {
    const medication = allMedications.find(med => med.id === medicationId);
    return medication?.name || 'ไม่พบข้อมูลยา';
  };

  return (
    <>
      <Separator />
      
      <div>
        <h3 className="font-medium mb-2">รายการยาที่จ่ายแล้ว ({medications.length} รายการ)</h3>
        <ul className="space-y-2">
          {medications.map((med, index) => (
            <li key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
              <div className="flex-1">
                <div className="font-medium">{getMedicationName(med.medication_id)}</div>
                <div className="text-sm text-gray-600">
                  ขนาดยา: {med.dosage}
                  {med.instructions && ` | ${med.instructions}`}
                </div>
                <div className="text-xs text-gray-500">
                  วันที่จ่าย: {new Date(med.created_at).toLocaleDateString('th-TH')}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default DispensedMedicationsList;
