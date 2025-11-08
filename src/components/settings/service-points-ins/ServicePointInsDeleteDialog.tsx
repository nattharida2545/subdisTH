import React from 'react';
import { Button } from '@/components/ui/button';
import { ServicePoint } from '@/integrations/supabase/schema';
import { Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface ServicePointInsDeleteDialogProps {
  servicePoint: ServicePoint;
  onDelete: (id: string) => Promise<void>;
}

const ServicePointInsDeleteDialog: React.FC<ServicePointInsDeleteDialogProps> = ({
  servicePoint,
  onDelete,
}) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>ยืนยันการลบจุดบริการ INS</AlertDialogTitle>
          <AlertDialogDescription>
            คุณต้องการลบจุดบริการ INS {servicePoint.name} ({servicePoint.code}) ใช่หรือไม่?
            การลบจะไม่สามารถเรียกคืนได้
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
          <AlertDialogAction onClick={() => onDelete(servicePoint.id)}>ลบ</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ServicePointInsDeleteDialog;
