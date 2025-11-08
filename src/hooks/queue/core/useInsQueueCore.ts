import { useState, useCallback, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QueueIns, QueueStatus } from "@/integrations/supabase/schema";
import { toast } from "sonner";
import { createLogger } from "@/utils/logger";
import { getTodayDate } from "@/utils/dateUtils";

const logger = createLogger("useInsQueueCore");

export const useInsQueueCore = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: queues = [], isLoading: queryLoading } = useQuery({
    queryKey: ["queues_ins"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("queues_ins")
        .select("*")
        .eq("queue_date", getTodayDate())
        // .not("service_point_id", "is", null)
        .order("created_at", { ascending: true });

      if (error) {
        logger.error("Error fetching INS queues:", error);
        throw error;
      }

      return data || [];
    },
    refetchInterval: 5000,
  });

  const { data: allQueuesNofilter = [] } = useQuery({
    queryKey: ["allQueuesInsNofilter"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("queues_ins")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        logger.error("Error fetching all INS queues:", error);
        throw error;
      }

      return data || [];
    },
    refetchInterval: 5000,
  });

  const { data: allQueues = [] } = useQuery({
    queryKey: ["queues_ins_all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("queues_ins")
        .select("*")
        .eq("queue_date", getTodayDate())
        .order("created_at", { ascending: true });

      if (error) {
        logger.error("Error fetching all INS queues:", error);
        throw error;
      }

      return data || [];
    },
    refetchInterval: 5000,
  });

  const fetchQueues = useCallback(
    async (force = false) => {
      setLoading(true);
      try {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["queues_ins"] }),
          queryClient.invalidateQueries({ queryKey: ["queues_ins_all"] }),
        ]);
        if (force) {
          await Promise.all([
            queryClient.refetchQueries({ queryKey: ["queues_ins"] }),
            queryClient.refetchQueries({ queryKey: ["queues_ins_all"] }),
          ]);
        }
      } catch (error) {
        logger.error("Error fetching INS queues:", error);
        setError("Failed to fetch INS queues");
      } finally {
        setLoading(false);
      }
    },
    [queryClient]
  );

  const addQueue = useCallback(
    async (queueData: Partial<QueueIns>): Promise<QueueIns | null> => {
      try {
        // Ensure required fields are present
        const insertData = {
          number: queueData.number!,
          type: queueData.type || "GENERAL",
          status: queueData.status || "WAITING",
          service_point_id: queueData.service_point_id,
          phone_number: queueData.phone_number,
          ID_card: queueData.ID_card,
          queue_date: queueData.queue_date || getTodayDate(),
        };

        const { data, error } = await supabase
          .from("queues_ins")
          .insert(insertData)
          .select()
          .single();

        if (error) {
          logger.error("Error adding INS queue:", error);
          toast.error("ไม่สามารถเพิ่มคิว INS ได้");
          return null;
        }

        if (data) {
          await fetchQueues();
          toast.success("เพิ่มคิว INS เรียบร้อยแล้ว");
          return data;
        }

        return null;
      } catch (error) {
        logger.error("Error in addQueue INS:", error);
        toast.error("เกิดข้อผิดพลาดในการเพิ่มคิว INS");
        return null;
      }
    },
    [fetchQueues]
  );

  const updateQueueStatus = useCallback(
    async (queueId: string, status: QueueStatus): Promise<QueueIns | null> => {
      try {
        const updateData: any = { status };

        // Add timestamp fields based on status
        if (status === "ACTIVE") {
          updateData.called_at = new Date().toISOString();
        } else if (status === "COMPLETED") {
          updateData.completed_at = new Date().toISOString();
        } else if (status === "SKIPPED") {
          updateData.skipped_at = new Date().toISOString();
        } else if (status === "CANCELLED") {
          updateData.cancelled_at = new Date().toISOString();
        }

        const { data, error } = await supabase
          .from("queues_ins")
          .update(updateData)
          .eq("id", queueId)
          .select()
          .single();

        if (error) {
          logger.error("Error updating INS queue status:", error);
          toast.error("ไม่สามารถอัปเดตสถานะคิว INS ได้");
          return null;
        }

        if (data) {
          await fetchQueues();
          return data;
        }

        return null;
      } catch (error) {
        logger.error("Error in updateQueueStatus INS:", error);
        toast.error("เกิดข้อผิดพลาดในการอัปเดตสถานะคิว INS");
        return null;
      }
    },
    [fetchQueues]
  );

  const removeQueue = useCallback(
    async (queueId: string): Promise<boolean> => {
      try {
        const { error } = await supabase
          .from("queues_ins")
          .delete()
          .eq("id", queueId);

        if (error) {
          logger.error("Error removing INS queue:", error);
          toast.error("ไม่สามารถลบคิว INS ได้");
          return false;
        }

        await fetchQueues();
        toast.success("ลบคิว INS เรียบร้อยแล้ว");
        return true;
      } catch (error) {
        logger.error("Error in removeQueue INS:", error);
        toast.error("เกิดข้อผิดพลาดในการลบคิว INS");
        return false;
      }
    },
    [fetchQueues]
  );

  const updateQueueInState = useCallback(
    (updatedQueue: QueueIns) => {
      queryClient.setQueryData(["queues_ins"], (oldQueues: QueueIns[] = []) => {
        return oldQueues.map((queue) =>
          queue.id === updatedQueue.id ? updatedQueue : queue
        );
      });
    },
    [queryClient]
  );

  const getQueuesByStatus = useCallback(
    (status: QueueStatus) => {
      return queues.filter((queue) => queue.status === status);
    },
    [queues]
  );

  useEffect(() => {
    if (queryLoading) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [queryLoading]);

  return {
    queues,
    loading: loading || queryLoading,
    error,
    fetchQueues,
    addQueue,
    updateQueueStatus,
    removeQueue,
    getQueuesByStatus,
    updateQueueInState,
    allQueues,
    allQueuesNofilter,
  };
};
