
import React, { useEffect, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { QueueType } from '@/integrations/supabase/schema';
import { formatQueueNumber } from '@/utils/queueFormatters';
import { printQueueTicket } from '@/utils/printUtils';
import { toast } from 'sonner';
import { createLogger } from '@/utils/logger';

import QueueCreatedHeader from './dialog-parts/QueueCreatedHeader';
import QueueCreatedContent from './dialog-parts/QueueCreatedContent';
import DialogFooterActions from './dialog-parts/DialogFooterActions';

const logger = createLogger('QueueCreatedDialog');

interface QueueCreatedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  queueNumber: number;
  queueType: QueueType;
  patientName?: string;
  patientPhone?: string;
  patientLineId?: string;
  purpose?: string;
}

const QueueCreatedDialog: React.FC<QueueCreatedDialogProps> = ({
  open,
  onOpenChange,
  queueNumber,
  queueType = 'GENERAL',
  patientName = '',
  patientPhone = '',
  patientLineId = '',
  purpose = '',
}) => {
  logger.debug(`Rendering with open=${open}, queueNumber=${queueNumber}, queueType=${queueType}`);
  const dialogRef = useRef<HTMLDivElement>(null);
  const formattedQueueNumber = formatQueueNumber(queueType, queueNumber);
  const [estimatedWaitTime, setEstimatedWaitTime] = React.useState(15);
  
  // Track when dialog is opened/closed - fixed with a stable dependency array
  useEffect(() => {
    if (open) {
      logger.info(`QUEUE CREATED DIALOG OPENED`);
      logger.debug(`- queueNumber: ${queueNumber}`);
      logger.debug(`- queueType: ${queueType}`);
      logger.debug(`- patientName: ${patientName || 'none'}`);
      logger.debug(`- formattedQueueNumber: ${formattedQueueNumber}`);
    } else {
      logger.debug(`DIALOG CLOSED`);
    }
  }, [open, queueNumber, queueType, patientName, formattedQueueNumber]);
  
  const handlePrint = React.useCallback(() => {
    logger.info('PRINT BUTTON CLICKED');
    try {
      printQueueTicket({
        queueNumber,
        queueType,
        patientName,
        patientPhone,
        patientLineId,
        purpose,
        estimatedWaitTime
      });
      
      // Show print success message
      toast.success('กำลังพิมพ์บัตรคิว', { id: "print-ticket" });
    } catch (error) {
      logger.error('Error printing ticket:', error);
      toast.error('เกิดข้อผิดพลาดในการพิมพ์บัตรคิว', { id: "print-ticket" });
    }
  }, [queueNumber, queueType, patientName, patientPhone, patientLineId, purpose, estimatedWaitTime]);

  // Force focus on dialog when it opens - using a stable dependency array
  useEffect(() => {
    if (open && dialogRef.current) {
      const timer = setTimeout(() => {
        const dialogElement = dialogRef.current?.querySelector('[role="dialog"]');
        if (dialogElement) {
          (dialogElement as HTMLElement).focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  return (
    <Dialog 
      open={open} 
      onOpenChange={onOpenChange}
    >
      <DialogContent 
        ref={dialogRef} 
        className="sm:max-w-[400px] bg-background"
      >
        <QueueCreatedHeader purpose={purpose} />
        
        <QueueCreatedContent 
          formattedQueueNumber={formattedQueueNumber}
          queueNumber={queueNumber}
          queueType={queueType}
          patientName={patientName}
          patientPhone={patientPhone}
          patientLineId={patientLineId}
        />
        
        <DialogFooterActions 
          onPrint={handlePrint}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default QueueCreatedDialog;
