
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { PatientMedication } from '@/hooks/usePatientMedications';
import { formatThaiDate } from '@/utils/dateUtils';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PatientMedicationHistoryProps {
  patientName?: string;
  medications: PatientMedication[];
  loading: boolean;
  onRefresh?: () => void;
  showCheckNotes?: boolean; // Show check notes column (for PatientDashboard and InsQueue)
}

const PatientMedicationHistory: React.FC<PatientMedicationHistoryProps> = ({
  patientName,
  medications,
  loading,
  onRefresh,
  showCheckNotes = false
}) => {
  const [checkNotes, setCheckNotes] = useState<Record<string, string>>({});
  const [selectedCheckNote, setSelectedCheckNote] = useState<string | null>(null);
  const [loadingCheckNotes, setLoadingCheckNotes] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('PatientMedicationHistory updated:', {
      patientName,
      medicationsCount: medications.length,
      loading,
      medications
    });
  }, [patientName, medications, loading]);

  // Fetch check notes for medications that have patient_check_id
  useEffect(() => {
    const fetchCheckNotes = async () => {
      const checkIds = medications
        .filter(med => med.patient_check_id)
        .map(med => med.patient_check_id!);
      
      if (checkIds.length === 0) return;

      setLoadingCheckNotes(true);
      try {
        const { data, error } = await supabase
          .from('patient_check')
          .select('id, check_note')
          .in('id', checkIds);

        if (!error && data) {
          const notesMap: Record<string, string> = {};
          data.forEach(check => {
            notesMap[check.id] = check.check_note || '';
          });
          setCheckNotes(notesMap);
        }
      } catch (error) {
        console.error('Error fetching check notes:', error);
      } finally {
        setLoadingCheckNotes(false);
      }
    };

    fetchCheckNotes();
  }, [medications]);

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
                  {showCheckNotes && (
                    <TableHead className="text-center">บันทึกการตรวจ</TableHead>
                  )}
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
                    {showCheckNotes && (
                      <TableCell className="text-center">
                        {med.patient_check_id && checkNotes[med.patient_check_id] ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedCheckNote(checkNotes[med.patient_check_id!])}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Check Note Dialog */}
      <Dialog open={!!selectedCheckNote} onOpenChange={() => setSelectedCheckNote(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>บันทึกการตรวจ/การรักษา</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm whitespace-pre-wrap">{selectedCheckNote}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PatientMedicationHistory;
