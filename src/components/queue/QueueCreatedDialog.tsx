import React, { useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { QueueType } from "@/integrations/supabase/schema";
import { formatQueueNumber } from "@/utils/queueFormatters";
import { printQueueTicket } from "@/utils/printUtils";
import { toast } from "sonner";
import { createLogger } from "@/utils/logger";
import { supabase } from "@/integrations/supabase/client";

import QueueCreatedHeader from "./dialog-parts/QueueCreatedHeader";
import QueueCreatedContent from "./dialog-parts/QueueCreatedContent";
import DialogFooterActions from "./dialog-parts/DialogFooterActions";
import { getTodayDate } from "@/utils/dateUtils";

const logger = createLogger("QueueCreatedDialog");

interface QueueCreatedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  queueNumber: number;
  queueType: QueueType;
  patientName?: string;
  patientPhone?: string;
  patientLineId?: string;
  purpose?: string;
  waitTiemQueueNext?: number;
  onDialogClose?: () => void; // New prop to handle complete reset
}

const QueueCreatedDialog: React.FC<QueueCreatedDialogProps> = ({
  open,
  onOpenChange,
  queueNumber,
  queueType = "GENERAL",
  patientName = "",
  patientPhone = "",
  patientLineId = "",
  purpose = "",
  waitTiemQueueNext = 0,
  onDialogClose,
}) => {
  logger.debug(
    `Rendering with open=${open}, queueNumber=${queueNumber}, queueType=${queueType}`
  );
  const dialogRef = useRef<HTMLDivElement>(null);
  const formattedQueueNumber = formatQueueNumber(queueType, queueNumber);
  const [estimatedWaitTime, setEstimatedWaitTime] = React.useState(15);
  const [calculatedWaitTime, setCalculatedWaitTime] = React.useState(
    waitTiemQueueNext || 0
  );

  // ฟังก์ชันคำนวณเวลารอคิว
  const calculateWaitTimeQueueNext = React.useCallback(async () => {
    try {
      // ดึงข้อมูลคิวที่มีสถานะ WAITING
      const today = getTodayDate();

      const { data: waitingQueues, error } = await supabase
        .from("queues")
        .select("*")
        .eq("queue_date", today)
        .eq("status", "WAITING")
        .order("created_at", { ascending: true });

      if (error) {
        logger.error("Error fetching waiting queues:", error);
        return 0;
      }

      // คำนวณเวลารอโดยคิดเพิ่ม 10 นาทีต่อคิว
      const waitTimePerQueue = 10;
      const calculatedTime = waitingQueues.length * waitTimePerQueue;

      setCalculatedWaitTime(calculatedTime);
      return calculatedTime;
    } catch (error) {
      logger.error("Error calculating wait time:", error);
      return 0;
    }
  }, []);

  // Track when dialog is opened/closed - fixed with a stable dependency array
  useEffect(() => {
    if (open) {
      logger.info(`QUEUE CREATED DIALOG OPENED`);
      logger.debug(`- queueNumber: ${queueNumber}`);
      logger.debug(`- queueType: ${queueType}`);
      logger.debug(`- patientName: ${patientName || "none"}`);
      logger.debug(`- formattedQueueNumber: ${formattedQueueNumber}`);

      // Calculate wait time when dialog opens
      calculateWaitTimeQueueNext();
    } else {
      logger.debug(`DIALOG CLOSED`);
    }
  }, [
    open,
    queueNumber,
    queueType,
    patientName,
    formattedQueueNumber,
    calculateWaitTimeQueueNext,
  ]);

  const handlePrint = React.useCallback(() => {
    logger.info("PRINT BUTTON CLICKED");
    try {
      printQueueTicket({
        queueNumber,
        queueType,
        patientName,
        patientPhone,
        patientLineId,
        purpose,
        waitTiemQueueNext: calculatedWaitTime,
      });

      // Show print success message
      toast.success("กำลังพิมพ์บัตรคิว", { id: "print-ticket" });
    } catch (error) {
      logger.error("Error printing ticket:", error);
      toast.error("เกิดข้อผิดพลาดในการพิมพ์บัตรคิว", { id: "print-ticket" });
    }
  }, [
    queueNumber,
    queueType,
    patientName,
    patientPhone,
    patientLineId,
    purpose,
    calculatedWaitTime,
  ]);

  // Enhanced close handler that triggers complete reset
  const handleClose = React.useCallback(() => {
    logger.debug("QueueCreatedDialog closing, triggering complete reset");
    onOpenChange(false);

    // Trigger the parent dialog reset after a short delay to ensure proper state cleanup
    if (onDialogClose) {
      setTimeout(() => {
        onDialogClose();
      }, 100);
    }
  }, [onOpenChange, onDialogClose]);

  // Force focus on dialog when it opens - using a stable dependency array
  useEffect(() => {
    if (open && dialogRef.current) {
      const timer = setTimeout(() => {
        const dialogElement =
          dialogRef.current?.querySelector('[role="dialog"]');
        if (dialogElement) {
          (dialogElement as HTMLElement).focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent ref={dialogRef} className="sm:max-w-[400px] bg-background">
        <QueueCreatedHeader
          purpose={purpose}
          waitTiemQueueNext={calculatedWaitTime}
        />

        <QueueCreatedContent
          formattedQueueNumber={formattedQueueNumber}
          queueNumber={queueNumber}
          queueType={queueType}
          patientName={patientName}
          patientPhone={patientPhone}
          patientLineId={patientLineId}
        />

        <DialogFooterActions onPrint={handlePrint} onClose={handleClose} />
      </DialogContent>
    </Dialog>
  );
};

export default QueueCreatedDialog;
