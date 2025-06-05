
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Copy, Copy as CopyIcon } from 'lucide-react';
import { PatientMedication } from '@/hooks/usePatientMedications';
import { formatThaiDate } from '@/utils/dateUtils';
import { Skeleton } from '@/components/ui/skeleton';

interface MedicationHistoryPanelProps {
  medications: PatientMedication[];
  loading: boolean;
  onCopySelected: (medications: PatientMedication[]) => void;
  onCopyAll: () => void;
}

const MedicationHistoryPanel: React.FC<MedicationHistoryPanelProps> = ({
  medications,
  loading,
  onCopySelected,
  onCopyAll
}) => {
  const [selectedMedications, setSelectedMedications] = useState<Set<string>>(new Set());

  const handleCheckboxChange = (medicationId: string, checked: boolean) => {
    const newSelected = new Set(selectedMedications);
    if (checked) {
      newSelected.add(medicationId);
    } else {
      newSelected.delete(medicationId);
    }
    setSelectedMedications(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedMedications(new Set(medications.map(med => med.id)));
    } else {
      setSelectedMedications(new Set());
    }
  };

  const handleCopySelected = () => {
    const selectedMeds = medications.filter(med => selectedMedications.has(med.id));
    onCopySelected(selectedMeds);
    setSelectedMedications(new Set()); // Clear selection after copying
  };

  const handleCopyAll = () => {
    onCopyAll();
    setSelectedMedications(new Set()); // Clear selection after copying
  };

  const allSelected = medications.length > 0 && selectedMedications.size === medications.length;
  const someSelected = selectedMedications.size > 0;

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">ประวัติการรับยา</CardTitle>
          <div className="flex gap-2">
            {someSelected && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopySelected}
                className="text-xs"
              >
                <Copy className="h-3 w-3 mr-1" />
                คัดลอก ({selectedMedications.size})
              </Button>
            )}
            {medications.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyAll}
                className="text-xs"
              >
                <CopyIcon className="h-3 w-3 mr-1" />
                คัดลอกทั้งหมด
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-4 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : medications.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <div className="mb-2">ไม่พบประวัติการรับยา</div>
            <div className="text-sm">เมื่อจ่ายยาแล้ว ประวัติจะแสดงที่นี่</div>
          </div>
        ) : (
          <div className="max-h-[500px] overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-white z-10">
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={handleSelectAll}
                      className={someSelected && !allSelected ? "data-[state=indeterminate]:bg-primary" : ""}
                    />
                  </TableHead>
                  <TableHead>วันที่</TableHead>
                  <TableHead>ชื่อยา</TableHead>
                  <TableHead>ขนาดยา</TableHead>
                  <TableHead>คำแนะนำ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medications.map((med) => (
                  <TableRow key={med.id} className="hover:bg-gray-50">
                    <TableCell>
                      <Checkbox
                        checked={selectedMedications.has(med.id)}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange(med.id, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell className="font-medium whitespace-nowrap">
                      {formatThaiDate(med.start_date)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{med.medication?.name || 'ไม่ระบุ'}</div>
                        <div className="text-xs text-gray-500">
                          {med.medication?.code || '-'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{med.dosage}</TableCell>
                    <TableCell className="max-w-[200px] break-words text-sm">
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

export default MedicationHistoryPanel;
