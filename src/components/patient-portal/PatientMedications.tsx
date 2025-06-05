
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pill, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { usePatientMedications } from '@/hooks/usePatientMedications';

interface PatientMedicationsProps {
  patientId: string;
}

const PatientMedications: React.FC<PatientMedicationsProps> = ({ patientId }) => {
  const { medications, loading } = usePatientMedications(patientId);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-pharmacy-600" />
            รายการยา
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!medications || medications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-pharmacy-600" />
            รายการยา
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Info className="mx-auto h-12 w-12 text-gray-400 mb-2" />
            <p className="text-gray-600">ไม่พบข้อมูลยาสำหรับผู้ป่วยรายนี้</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Pill className="h-5 w-5 text-pharmacy-600" />
          รายการยา
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {medications.map((med) => (
            <div 
              key={med.id} 
              className="p-4 rounded-md border border-gray-200 hover:border-pharmacy-200 hover:bg-pharmacy-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-pharmacy-700">
                    {med.medication?.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{med.dosage}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-pharmacy-100 text-pharmacy-700">
                    {med.medication?.unit}
                  </span>
                </div>
              </div>
              
              {med.medication?.description && (
                <p className="text-sm text-gray-500 mt-2">
                  {med.medication.description}
                </p>
              )}

              {med.instructions && (
                <p className="text-sm text-gray-600 mt-2">
                  {med.instructions}
                </p>
              )}
              
              <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                <span>
                  เริ่ม: {format(new Date(med.start_date), 'PP', { locale: th })}
                </span>
                {med.end_date && (
                  <span>
                    สิ้นสุด: {format(new Date(med.end_date), 'PP', { locale: th })}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientMedications;
