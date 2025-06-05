
import React from 'react';
import { DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, MessageSquare, Calendar } from 'lucide-react';

interface DialogFooterActionsProps {
  onPrint: () => void;
  onClose: () => void;
  onScheduleNotification?: () => void;
  onSendSms?: () => void;
}

const DialogFooterActions: React.FC<DialogFooterActionsProps> = ({
  onPrint,
  onClose,
  onScheduleNotification,
  onSendSms,
}) => {
  console.log('[DialogFooterActions] Rendering footer actions');

  const handlePrintClick = (e: React.MouseEvent) => {
    console.log(`----------------------------------------`);
    console.log('🖨️🖨️🖨️ PRINT BUTTON CLICKED 🖨️🖨️🖨️');
    console.log(`----------------------------------------`);
    e.preventDefault(); // Prevent default behavior
    e.stopPropagation(); // Stop propagation to prevent dialog closing
    onPrint();
  };

  const handleCloseClick = (e: React.MouseEvent) => {
    console.log(`----------------------------------------`);
    console.log('❌ CLOSE BUTTON CLICKED');
    console.log(`----------------------------------------`);
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  return (
    <DialogFooter className="flex flex-col sm:flex-row gap-2">
      <Button 
        variant="outline"
        onClick={handlePrintClick}
        className="w-full sm:w-auto flex items-center gap-2"
        type="button"
      >
        <Printer className="h-4 w-4" />
        พิมพ์คิว
      </Button>
      
      {onSendSms && (
        <Button 
          variant="outline"
          onClick={(e) => {
            console.log(`----------------------------------------`);
            console.log('[DialogFooterActions] SEND SMS BUTTON CLICKED');
            console.log(`----------------------------------------`);
            e.preventDefault();
            e.stopPropagation();
            onSendSms();
          }} 
          className="w-full sm:w-auto flex items-center gap-2"
          type="button"
        >
          <MessageSquare className="h-4 w-4" />
          ส่ง SMS
        </Button>
      )}
      
      {onScheduleNotification && (
        <Button 
          variant="outline"
          onClick={(e) => {
            console.log(`----------------------------------------`);
            console.log('[DialogFooterActions] SCHEDULE NOTIFICATION BUTTON CLICKED');
            console.log(`----------------------------------------`);
            e.preventDefault();
            e.stopPropagation();
            onScheduleNotification();
          }} 
          className="w-full sm:w-auto flex items-center gap-2"
          type="button"
        >
          <Calendar className="h-4 w-4" />
          ตั้งเวลาแจ้งเตือน
        </Button>
      )}
      
      <Button 
        onClick={handleCloseClick}
        className="w-full sm:w-auto bg-pharmacy-600 hover:bg-pharmacy-700"
        type="button"
      >
        ตกลง
      </Button>
    </DialogFooter>
  );
};

export default DialogFooterActions;
