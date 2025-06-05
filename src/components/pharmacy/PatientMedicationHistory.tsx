
import React, { useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { PatientMedication } from '@/hooks/usePatientMedications';
import { formatThaiDate } from '@/utils/dateUtils';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PatientMedicationHistoryProps {
  patientName?: string;
  medications: PatientMedication[];
  loading: boolean;
  onRefresh?: () => void;
}

const PatientMedicationHistory: React.FC<PatientMedicationHistoryProps> = ({
  patientName,
  medications,
  loading,
  onRefresh
}) => {
  // Debug logging
  useEffect(() => {
    console.log('PatientMedicationHistory updated:', {
      patientName,
      medicationsCount: medications.length,
      loading,
      medications
    });
  }, [patientName, medications, loading]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">
          ประวัติการรับยาของ {patientName || 'ผู้ป่วย'}
        </CardTitle>
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : medications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="mb-2">ไม่พบประวัติการรับยา</div>
            <div className="text-sm">เมื่อจ่ายยาแล้ว ประวัติจะแสดงที่นี่</div>
          </div>
        ) : (
          <div className="overflow-auto max-h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>วันที่</TableHead>
                  <TableHead>ชื่อยา</TableHead>
                  <TableHead>รหัสยา</TableHead>
                  <TableHead>ขนาดยา</TableHead>
                  <TableHead>คำแนะนำ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medications.map((med) => (
                  <TableRow key={med.id}>
                    <TableCell className="font-medium whitespace-nowrap">
                      {formatThaiDate(med.start_date)}
                    </TableCell>
                    <TableCell>{med.medication?.name || 'ไม่ระบุ'}</TableCell>
                    <TableCell className="text-xs text-gray-600">
                      {med.medication?.code || '-'}
                    </TableCell>
                    <TableCell>{med.dosage}</TableCell>
                    <TableCell className="max-w-[250px] break-words">
                      {med.instructions || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientMedicationHistory;
