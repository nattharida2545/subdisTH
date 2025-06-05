
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X } from 'lucide-react';
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

interface CancelAllQueuesButtonProps {
  waitingQueuesCount: number;
  onCancelAll: () => Promise<void>;
  isLoading?: boolean;
}

const CancelAllQueuesButton: React.FC<CancelAllQueuesButtonProps> = ({
  waitingQueuesCount,
  onCancelAll,
  isLoading = false
}) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleCancelAll = async () => {
    await onCancelAll();
    setShowConfirmDialog(false);
  };

  if (waitingQueuesCount === 0) {
    return null;
  }

  return (
    <>
      <Button
        variant="destructive"
        onClick={() => setShowConfirmDialog(true)}
        disabled={isLoading}
        className="flex items-center gap-2"
      >
        <X className="w-4 h-4" />
        ยกเลิกคิวทั้งหมด ({waitingQueuesCount})
      </Button>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              ยืนยันการยกเลิกคิวทั้งหมด
            </AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการยกเลิกคิวที่รออยู่ทั้งหมด {waitingQueuesCount} คิว หรือไม่?
              <br />
              <strong className="text-destructive">การดำเนินการนี้ไม่สามารถย้อนกลับได้</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelAll}
              className="bg-destructive hover:bg-destructive/90"
              disabled={isLoading}
            >
              {isLoading ? 'กำลังยกเลิก...' : 'ยืนยันยกเลิกทั้งหมด'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CancelAllQueuesButton;
