
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Medication } from '@/integrations/supabase/schema';
import MedicationStatusBadge from './MedicationStatusBadge';
import { Edit, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useMedicationsContext } from './context/MedicationsContext';

interface MedicationsTableProps {
  medications: Medication[];
  filterText: string;
  filterFunction?: (med: Medication) => boolean;
  onEditMedication: (medication: Medication) => void;
}

const MedicationsTable: React.FC<MedicationsTableProps> = ({ 
  medications, 
  filterText, 
  filterFunction,
  onEditMedication
}) => {
  const [medicationToDelete, setMedicationToDelete] = React.useState<string | null>(null);
  const { deleteMedication } = useMedicationsContext();

  // Ensure medications is an array even if undefined
  const medicationItems = medications || [];
  
  // Apply custom filter function if provided, otherwise use all medications
  const filteredMedications = filterFunction 
    ? medicationItems.filter(filterFunction) 
    : medicationItems.filter(med => 
        med.name.toLowerCase().includes(filterText.toLowerCase()) ||
        med.code.toLowerCase().includes(filterText.toLowerCase())
      );

  const handleDelete = async () => {
    if (medicationToDelete) {
      await deleteMedication(medicationToDelete);
      setMedicationToDelete(null);
    }
  };

  const getMedicationById = (id: string) => {
    return medicationItems.find(med => med.id === id);
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>รหัสยา</TableHead>
            <TableHead>ชื่อยา</TableHead>
            <TableHead>หน่วย</TableHead>
            <TableHead>คงเหลือ</TableHead>
            <TableHead>สถานะ</TableHead>
            <TableHead>การจัดการ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredMedications.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6">ไม่พบรายการยาตามที่ค้นหา</TableCell>
            </TableRow>
          ) : (
            filteredMedications.map((med) => (
              <TableRow key={med.id}>
                <TableCell className="font-medium">{med.code}</TableCell>
                <TableCell>{med.name}</TableCell>
                <TableCell>{med.unit}</TableCell>
                <TableCell>{med.stock} {med.unit}</TableCell>
                <TableCell>
                  <MedicationStatusBadge stock={med.stock} minStock={med.min_stock} />
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 px-2 text-xs"
                      onClick={() => onEditMedication(med)}
                    >
                      <Edit className="h-3.5 w-3.5 mr-1" />
                      แก้ไข
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 px-2 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => setMedicationToDelete(med.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      ลบ
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <AlertDialog open={!!medicationToDelete} onOpenChange={(open) => !open && setMedicationToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
            <AlertDialogDescription>
              คุณแน่ใจหรือไม่ว่าต้องการลบยา "{medicationToDelete && getMedicationById(medicationToDelete)?.name}"? 
              การกระทำนี้ไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>
              ลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MedicationsTable;
