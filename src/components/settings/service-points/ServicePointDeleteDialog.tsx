
import React from 'react';
import { Button } from '@/components/ui/button';
import { ServicePoint } from '@/integrations/supabase/schema';
import { Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface ServicePointDeleteDialogProps {
  servicePoint: ServicePoint;
  onDelete: (id: string) => Promise<void>;
}

const ServicePointDeleteDialog: React.FC<ServicePointDeleteDialogProps> = ({
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
          <AlertDialogTitle>ยืนยันการลบจุดบริการ</AlertDialogTitle>
          <AlertDialogDescription>
            คุณต้องการลบจุดบริการ {servicePoint.name} ({servicePoint.code}) ใช่หรือไม่?
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

export default ServicePointDeleteDialog;
