
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useQueueTransfer } from './useQueueTransfer';
import QueueTransferFormFields from './QueueTransferFormFields';
import { QueueTransferDialogProps } from './types';

const QueueTransferDialog: React.FC<QueueTransferDialogProps> = ({
  queue,
  open,
  onOpenChange,
  servicePoints,
  queueTypes,
  currentServicePointId,
  onTransfer,
}) => {
  const {
    formState,
    isTransferring,
    handleTargetServicePointChange,
    handleNotesChange,
    handleQueueTypeChange,
    handleTransfer
  } = useQueueTransfer(queue, open, currentServicePointId, onTransfer);

  // Handle the transfer with dialog closing
  const processTransfer = async () => {
    const success = await handleTransfer();
    if (success) {
      onOpenChange(false);
    }
  };

  if (!queue) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>โอนคิว</DialogTitle>
          <DialogDescription>
            กรุณาเลือกจุดบริการที่ต้องการโอนคิวไป
          </DialogDescription>
        </DialogHeader>
        
        <QueueTransferFormFields
          queue={queue}
          formState={formState}
          servicePoints={servicePoints}
          queueTypes={queueTypes}
          currentServicePointId={currentServicePointId}
          onTargetServicePointChange={handleTargetServicePointChange}
          onNotesChange={handleNotesChange}
          onQueueTypeChange={handleQueueTypeChange}
          isTransferring={isTransferring}
        />
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isTransferring}
          >
            ยกเลิก
          </Button>
          <Button 
            onClick={processTransfer} 
            disabled={!formState.targetServicePointId || isTransferring}
          >
            {isTransferring ? 'กำลังโอน...' : 'โอนคิว'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QueueTransferDialog;
