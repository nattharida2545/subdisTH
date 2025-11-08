import { useCallback } from "react";
import { createLogger } from "@/utils/logger";
import { formatQueueNumber } from "@/utils/queueFormatters";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const logger = createLogger("useQueueActions");

interface UseQueueActionsProps {
  selectedServicePoint: any;
  servicePointQueues: any[];
  servicePoints: any[];
  callQueue: (queueId: string, servicePointId: string) => Promise<any>;
  updateQueueStatus: (queueId: string, status: any) => Promise<any>;
  recallQueue: (queueId: string) => void;
  transferQueueToServicePoint: (
    queueId: string,
    targetServicePointId: string
  ) => Promise<void>;
  returnSkippedQueueToWaiting: (queueId: string) => Promise<void>;
  removeQueue: (queueId: string) => Promise<void>;
}

export const useQueueActions = ({
  selectedServicePoint,
  servicePointQueues,
  servicePoints,
  callQueue,
  updateQueueStatus,
  recallQueue,
  transferQueueToServicePoint,
  returnSkippedQueueToWaiting,
  removeQueue,
}: UseQueueActionsProps) => {
  // Enhanced queue action handlers with proper formatting
  const handleCallQueue = useCallback(
    async (queueId: string): Promise<any> => {
      if (!selectedServicePoint) return null;

      const queue = servicePointQueues.find((q) => q.id === queueId);
      const formattedNumber = queue
        ? formatQueueNumber(queue.type as any, queue.number)
        : queueId;

      logger.debug(
        `Calling queue ${formattedNumber} for service point ${selectedServicePoint.code}`
      );

      try {
        const result = await callQueue(queueId, selectedServicePoint.id);
        if (result) {
          toast.success(`เรียกคิว ${formattedNumber} เรียบร้อยแล้ว`);
        }
        return result;
      } catch (error) {
        toast.error(`ไม่สามารถเรียกคิว ${formattedNumber} ได้`);
        throw error;
      }
    },
    [selectedServicePoint, callQueue, servicePointQueues]
  );

  const handleUpdateStatus = useCallback(
    async (queueId: string, status: any) => {
      const queue = servicePointQueues.find((q) => q.id === queueId);
      const formattedNumber = queue
        ? formatQueueNumber(queue.type as any, queue.number)
        : queueId;

      logger.debug(`Updating queue ${formattedNumber} status to ${status}`);
      console.log(`Updating queue ${formattedNumber} status to ${status}`);
      try {
        const result = await updateQueueStatus(queueId, status);
        if (result) {
          let message = "";
          switch (status) {
            case "COMPLETED":
              message = `คิว ${formattedNumber} เสร็จสิ้นการให้บริการแล้ว`;
              break;
            case "SKIPPED":
              message = `คิว ${formattedNumber} ถูกข้ามแล้ว`;
              break;
            case "WAITING":
              message = `คิว ${formattedNumber} ถูกนำกลับมารอคิวแล้ว`;
              break;
            case "PAUSED":
              message = `คิว ${formattedNumber} ถูกพักแล้ว`;
              break;
            default:
              message = `อัปเดตสถานะคิว ${formattedNumber} เรียบร้อยแล้ว`;
          }
          toast.success(message);
        }
        return result;
      } catch (error) {
        console.log(error);
        toast.error(`ไม่สามารถอัปเดตสถานะคิว ${formattedNumber} ได้`);
        throw error;
      }
    },
    [updateQueueStatus, servicePointQueues]
  );

  const handleRecallQueue = useCallback(
    async (queueId: string) => {
      const queue = servicePointQueues.find((q) => q.id === queueId);
      const formattedNumber = queue
        ? formatQueueNumber(queue.type as any, queue.number)
        : queueId;

      logger.debug(`Recalling queue ${formattedNumber}`);
      if (selectedServicePoint) {
        try {
          // Update called_at timestamp in the database
          const { error } = await supabase
            .from("queues")
            .update({ called_at: new Date().toISOString() })
            .eq("id", queueId);

          if (error) throw error;

          // Call the original recallQueue function
          recallQueue(queueId);
          toast.info(`เรียกซ้ำคิว ${formattedNumber}`);
        } catch (error) {
          console.error("Error updating called_at for queue recall:", error);
          toast.error(`เกิดข้อผิดพลาดในการเรียกซ้ำคิว ${formattedNumber}`);
        }
      }
    },
    [recallQueue, servicePointQueues, selectedServicePoint]
  );

  // Fix hold queue action to properly pause the queue instead of skipping it
  const handleHoldQueue = useCallback(
    async (queueId: string) => {
      const queue = servicePointQueues.find((q) => q.id === queueId);
      const formattedNumber = queue
        ? formatQueueNumber(queue.type as any, queue.number)
        : queueId;

      try {
        // Properly pause the queue by setting paused_at timestamp while keeping status as WAITING
        const { error } = await supabase
          .from("queues")
          .update({
            paused_at: new Date().toISOString(),
            status: "WAITING", // Keep status as WAITING, not SKIPPED
          })
          .eq("id", queueId);

        if (error) throw error;

        toast.success(`พักคิว ${formattedNumber} เรียบร้อยแล้ว`);
      } catch (error) {
        console.error("Error pausing queue:", error);
        toast.error(`ไม่สามารถพักคิว ${formattedNumber} ได้`);
      }
    },
    [servicePointQueues]
  );

  const handleTransferQueue = useCallback(
    async (queueId: string, targetServicePointId: string) => {
      const queue = servicePointQueues.find((q) => q.id === queueId);
      const formattedNumber = queue
        ? formatQueueNumber(queue.type as any, queue.number)
        : queueId;
      const targetServicePoint = servicePoints.find(
        (sp) => sp.id === targetServicePointId
      );

      try {
        await transferQueueToServicePoint(queueId, targetServicePointId);
        toast.success(
          `โอนคิว ${formattedNumber} ไปยัง ${
            targetServicePoint?.name || "จุดบริการอื่น"
          } เรียบร้อยแล้ว`
        );
      } catch (error) {
        toast.error(`ไม่สามารถโอนคิว ${formattedNumber} ได้`);
      }
    },
    [transferQueueToServicePoint, servicePointQueues, servicePoints]
  );

  // Fix return to waiting to handle both SKIPPED and paused queues
  const handleReturnToWaiting = useCallback(
    async (queueId: string) => {
      const queue = servicePointQueues.find((q) => q.id === queueId);
      const formattedNumber = queue
        ? formatQueueNumber(queue.type as any, queue.number)
        : queueId;

      try {
        if (queue?.paused_at) {
          // For paused queues, clear paused_at and ensure status is WAITING
          const { error } = await supabase
            .from("queues")
            .update({
              paused_at: null,
              status: "WAITING",
            })
            .eq("id", queueId);

          if (error) throw error;
        } else {
          // For skipped queues, use the existing function
          await returnSkippedQueueToWaiting(queueId);
        }

        toast.success(`นำคิว ${formattedNumber} กลับมารอเรียบร้อยแล้ว`);
      } catch (error) {
        console.error("Error returning queue to waiting:", error);
        toast.error(`ไม่สามารถนำคิว ${formattedNumber} กลับมารอได้`);
      }
    },
    [returnSkippedQueueToWaiting, servicePointQueues]
  );

  const handleCancelQueue = useCallback(
    async (queueId: string) => {
      const queue = servicePointQueues.find((q) => q.id === queueId);
      const formattedNumber = queue
        ? formatQueueNumber(queue.type as any, queue.number)
        : queueId;

      try {
        await removeQueue(queueId);
        toast.success(`ยกเลิกคิว ${formattedNumber} เรียบร้อยแล้ว`);
      } catch (error) {
        toast.error(`ไม่สามารถยกเลิกคิว ${formattedNumber} ได้`);
      }
    },
    [removeQueue, servicePointQueues]
  );

  return {
    handleCallQueue,
    handleUpdateStatus,
    handleRecallQueue,
    handleHoldQueue,
    handleTransferQueue,
    handleReturnToWaiting,
    handleCancelQueue,
  };
};
