import { useCallback, useMemo, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { QueueIns, ServicePointIns } from "@/integrations/supabase/schema";
import { toast } from "sonner";
import { useServicePointIns } from "@/hooks/useServicePointIns";
import logger from "@/utils/logger";
import { useSmsNotifications } from "@/hooks";
import { getTodayDate } from "@/utils/dateUtils";

interface UseInsQueueDataProps {
  servicePointId: string;
  refreshTrigger?: number;
}

interface QueuesByStatus {
  waiting: QueueIns[];
  active: QueueIns[];
  completed: QueueIns[];
  skipped: QueueIns[];
  paused: QueueIns[];
}

export const useInsQueueData = ({
  servicePointId,
  refreshTrigger = 0,
}: UseInsQueueDataProps) => {
  const [queues, setQueues] = useState<QueueIns[]>([]);
  const [loading, setLoading] = useState(false);
  const { servicePoints } = useServicePointIns();
  const { sendSmsToNextQueueIns } = useSmsNotifications();
  // Fetch queues
  const fetchQueues = useCallback(
    async (forceRefresh = false) => {
      if (!forceRefresh) return;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("queues_ins")
          .select("*")
          .eq("queue_date", getTodayDate())
          .order("created_at", { ascending: true });

        if (error) {
          console.error("Error fetching INS queues:", error);
          return;
        }
        console.log("Fetched INS queues:", data);
        setQueues((data || []) as QueueIns[]);
      } catch (error) {
        console.error("Error in fetchQueues:", error);
      } finally {
        setLoading(false);
      }
    },
    [refreshTrigger]
  );

  // Fetch queues on mount and when refreshTrigger changes
  useEffect(() => {
    fetchQueues(true);
  }, [fetchQueues, refreshTrigger]);

  // Filter queues for the selected service point
  const servicePointQueues = useMemo(() => {
    // if (!servicePointId) return [];

    return queues.filter((queue) => {
      // Check if queue has been transferred
      const hasBeenTransferred = queue.transferred_at && queue.transferred_to_service_point_id;
      
      // If queue has been transferred, only show it at the destination service point
      if (hasBeenTransferred) {
        // Only show at the transferred destination
        const isAtDestination = queue.transferred_to_service_point_id === servicePointId;
        if (!isAtDestination) {
          return false; // Don't show at original service point
        }
      } else {
        // For non-transferred queues, check original service point
        // const isServicePointMatch = queue.service_point_id === servicePointId;
      }

      // Include all relevant statuses
      const isRelevantStatus = [
        "WAITING",
        "ACTIVE",
        "COMPLETED",
        "SKIPPED",
        "CANCELLED",
      ].includes(queue.status || "");

      // More flexible date filtering - include last 3 days
      const today = new Date();
      const threeDaysAgo = new Date(today);
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const queueDate = queue.queue_date
        ? new Date(queue.queue_date + "T00:00:00")
        : new Date(queue.created_at || "");
      const isRecentQueue = queueDate >= threeDaysAgo;

      return isRelevantStatus && isRecentQueue;
    });
  }, [queues, servicePointId]);

  // Get selected service point
  const selectedServicePoint = servicePointId
    ? servicePoints.find((sp) => sp.id === servicePointId) || null
    : null;

  // Group queues by status
  const queuesByStatus: QueuesByStatus = useMemo(() => {
    const waiting = servicePointQueues.filter(
      (q) => q.status === "WAITING" && !q.paused_at
    );
    const active = servicePointQueues.filter(
      (q) => q.status === "ACTIVE" && q.service_point_id === servicePointId
    );
    const completed = servicePointQueues.filter(
      (q) => q.status === "COMPLETED" && q.service_point_id === servicePointId
    );
    const skipped = servicePointQueues.filter((q) => q.status === "SKIPPED");
    const paused = servicePointQueues.filter(
      (q) => q.status === "WAITING" && q.paused_at
    );

    return { waiting, active, completed, skipped, paused };
  }, [servicePointQueues, servicePointId]);

  // Queue action handlers
  const handleCallQueue = async (queueId: string) => {
    try {
      const { error } = await supabase
        .from("queues_ins")
        .update({
          status: "ACTIVE",
          called_at: new Date().toISOString(),
          service_point_id: servicePointId,
        })
        .eq("id", queueId);

      if (error) {
        console.error("Error calling queue:", error);
        toast.error("ไม่สามารถเรียกคิวได้");
        return;
      }

      try {
        await sendSmsToNextQueueIns();
      } catch (smsError) {
        logger.error("SMS notification error (non-blocking):", smsError);
        // Don't fail the main queue call if SMS fails
      }

      toast.success("เรียกคิวสำเร็จ");
      fetchQueues(true);
    } catch (error) {
      console.error("Error in handleCallQueue:", error);
      toast.error("เกิดข้อผิดพลาดในการเรียกคิว");
    }
  };

  const handleUpdateStatus = async (queueId: string, status: string) => {
    try {
      const updateData: any = { status };

      if (status === "COMPLETED") {
        updateData.completed_at = new Date().toISOString();
      } else if (status === "CANCELLED") {
        updateData.cancelled_at = new Date().toISOString();
      } else if (status === "SKIPPED") {
        updateData.skipped_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("queues_ins")
        .update(updateData)
        .eq("id", queueId);

      if (error) {
        console.error("Error updating queue status:", error);
        toast.error("ไม่สามารถอัพเดทสถานะคิวได้");
        return;
      }

      toast.success("อัพเดทสถานะคิวสำเร็จ");
      fetchQueues(true);
    } catch (error) {
      console.error("Error in handleUpdateStatus:", error);
      toast.error("เกิดข้อผิดพลาดในการอัพเดทสถานะคิว");
    }
  };

  const handleRecallQueue = async (queueId: string) => {
    try {
      // Instead of using recalled_at which doesn't exist in the schema,
      // we'll update the called_at timestamp to indicate a recall
      const { error } = await supabase
        .from("queues_ins")
        .update({ called_at: new Date().toISOString() })
        .eq("id", queueId);

      if (error) {
        console.error("Error recalling queue:", error);
        toast.error("ไม่สามารถเรียกคิวซ้ำได้");
        return;
      }

      toast.success("เรียกคิวซ้ำสำเร็จ");
      fetchQueues(true);
    } catch (error) {
      console.error("Error in handleRecallQueue:", error);
      toast.error("เกิดข้อผิดพลาดในการเรียกคิวซ้ำ");
    }
  };

  const handleHoldQueue = async (queueId: string) => {
    try {
      const { error } = await supabase
        .from("queues_ins")
        .update({ paused_at: new Date().toISOString(), status: "WAITING" })
        .eq("id", queueId);

      if (error) {
        console.error("Error holding queue:", error);
        toast.error("ไม่สามารถพักคิวได้");
        return;
      }

      toast.success("พักคิวสำเร็จ");
      fetchQueues(true);
    } catch (error) {
      console.error("Error in handleHoldQueue:", error);
      toast.error("เกิดข้อผิดพลาดในการพักคิว");
    }
  };

  const handleTransferQueue = async (
    queueId: string,
    targetServicePointId: string
  ) => {
    try {
      const { error } = await supabase
        .from("queues_ins")
        .update({
          service_point_id: targetServicePointId,
          transferred_to_service_point_id: targetServicePointId,
          transferred_at: new Date().toISOString(),
          status: "WAITING",
        })
        .eq("id", queueId);

      if (error) {
        console.error("Error transferring queue:", error);
        toast.error("ไม่สามารถโอนคิวได้");
        return;
      }

      toast.success("โอนคิวสำเร็จ");
      fetchQueues(true);
    } catch (error) {
      console.error("Error in handleTransferQueue:", error);
      toast.error("เกิดข้อผิดพลาดในการโอนคิว");
    }
  };

  const handleReturnToWaiting = async (queueId: string) => {
    try {
      const { error } = await supabase
        .from("queues_ins")
        .update({
          status: "WAITING",
          paused_at: null,
          skipped_at: null,
        })
        .eq("id", queueId);

      if (error) {
        console.error("Error returning queue to waiting:", error);
        toast.error("ไม่สามารถย้ายคิวกลับไปรอดำเนินการได้");
        return;
      }

      toast.success("ย้ายคิวกลับไปรอดำเนินการสำเร็จ");
      fetchQueues(true);
    } catch (error) {
      console.error("Error in handleReturnToWaiting:", error);
      toast.error("เกิดข้อผิดพลาดในการย้ายคิวกลับไปรอดำเนินการ");
    }
  };

  const handleCancelQueue = async (queueId: string) => {
    try {
      const { error } = await supabase
        .from("queues_ins")
        .update({
          status: "CANCELLED",
          cancelled_at: new Date().toISOString(),
        })
        .eq("id", queueId);

      if (error) {
        console.error("Error cancelling queue:", error);
        toast.error("ไม่สามารถยกเลิกคิวได้");
        return;
      }

      toast.success("ยกเลิกคิวสำเร็จ");
      fetchQueues(true);
    } catch (error) {
      console.error("Error in handleCancelQueue:", error);
      toast.error("เกิดข้อผิดพลาดในการยกเลิกคิว");
    }
  };

  // Get ID card from queue
  const getIdCard = (queue: QueueIns) => {
    return queue.ID_card || "ไม่ระบุเลขบัตร";
  };

  // Get ID card data
  const getIdCardData = (idCard: string) => {
    return idCard || "ไม่ระบุเลขบัตร";
  };

  // Manual refresh function
  const handleManualRefresh = useCallback(async () => {
    try {
      await fetchQueues(true);
      toast.success("รีเฟรชข้อมูลเรียบร้อยแล้ว");
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("ไม่สามารถรีเฟรชข้อมูลได้");
    }
  }, [fetchQueues]);

  return {
    selectedServicePoint,
    queuesByStatus,
    queues,
    getIdCard,
    getIdCardData,
    handleCallQueue,
    handleUpdateStatus,
    handleRecallQueue,
    handleHoldQueue,
    handleTransferQueue,
    handleReturnToWaiting,
    handleCancelQueue,
    handleManualRefresh,
    isLoading: loading,
    servicePoints: Array.isArray(servicePoints) ? servicePoints : [],
  };
};
