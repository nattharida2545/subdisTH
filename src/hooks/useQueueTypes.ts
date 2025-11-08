import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { QueueTypeEnum } from "@/integrations/supabase/schema";
import { toast } from "sonner";
import { createLogger } from "@/utils/logger";
import { QueueAlgorithmType } from "@/utils/queueAlgorithms";

const logger = createLogger("useQueueTypes");

// Extend the QueueType with additional properties from queue_types table
export interface QueueType {
  id: string;
  code: string;
  name: string;
  prefix: string;
  purpose?: string;
  format: "0" | "00" | "000";
  enabled: boolean;
  algorithm: string;
  priority: number;
  created_at?: string;
  updated_at?: string;
}

// Helper functions for type validations
export const ensureValidFormat = (
  format: string | undefined
): "0" | "00" | "000" => {
  if (format === "0" || format === "00" || format === "000") {
    return format;
  }
  return "00"; // Default to '00' format
};

export const ensureValidAlgorithm = (algorithm: string | undefined): string => {
  if (!algorithm) return QueueAlgorithmType.FIFO;
  return algorithm;
};

// Convert a QueueTypeEnum to QueueType if needed
export const convertToQueueType = (
  queueTypeEnum: QueueTypeEnum | QueueType
): QueueType => {
  if (typeof queueTypeEnum === "string") {
    // This is a QueueTypeEnum, create a basic QueueType from it
    return {
      id: queueTypeEnum,
      code: queueTypeEnum,
      name: queueTypeEnum,
      prefix: queueTypeEnum.charAt(0),
      format: "00",
      enabled: true,
      algorithm: QueueAlgorithmType.FIFO,
      priority: 5,
    };
  }
  // Already a QueueType, ensure format and algorithm are valid
  return {
    ...queueTypeEnum,
    format: ensureValidFormat(queueTypeEnum.format),
    algorithm: ensureValidAlgorithm(queueTypeEnum.algorithm),
  };
};

export const useQueueTypes = () => {
  const [queueTypes, setQueueTypes] = useState<QueueType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch queue types from the database
  const fetchQueueTypes = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("queue_types")
        .select("*")
        .order("priority", { ascending: true });

      const { data: queueTypesIns } = await (supabase as any)
        .from("queue_ins_types")
        .select("*");

      if (error) {
        throw error;
      }

      let typedData: QueueType[] = [];

      if (data) {
        // Ensure format property is correctly typed
        const formattedData = data.map((item) => ({
          ...item,
          format: ensureValidFormat(item.format),
          algorithm: ensureValidAlgorithm(item.algorithm),
        }));

        typedData.push(...formattedData);
      }

      if (queueTypesIns) {
        const formattedInsData = queueTypesIns.map((item) => ({
          ...item,
          format: ensureValidFormat(item.format),
          algorithm: ensureValidAlgorithm(item.algorithm),
        }));

        typedData.push(...formattedInsData);
      }

      setQueueTypes(typedData);
    } catch (err: any) {
      logger.error("Error fetching queue types:", err);
      setError(err.message || "Error fetching queue types");
      toast.error("Failed to load queue types");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueueTypes();
  }, []);

  return {
    queueTypes,
    loading,
    error,
    fetchQueueTypes,
    convertToQueueType,
  };
};

export default useQueueTypes;
