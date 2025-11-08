import { QueueIns } from "@/integrations/supabase/schema";
import { supabase } from "@/integrations/supabase/client";

// Queue type format configuration loaded from database/local cache
type QueueInsTypeFormatConfig = { prefix: string; padLength: number };
let queueInsTypeConfigs: Record<string, QueueInsTypeFormatConfig> = {};

const parsePadLength = (fmt: unknown): number => {
  if (typeof fmt === "string") return fmt.length || 3; // e.g. '000' -> 3
  if (typeof fmt === "number") return fmt || 3;
  return 3;
};

const mapQueueInsTypesToConfig = (
  items: any[]
): Record<string, QueueInsTypeFormatConfig> => {
  const mapped: Record<string, QueueInsTypeFormatConfig> = {};
  for (const item of items || []) {
    const code: string | undefined = item?.code;
    if (!code) continue;
    const prefix: string = (item?.prefix || code.charAt(0) || "I").toString();
    const padLength = parsePadLength(item?.format);
    mapped[code] = { prefix, padLength };
  }
  return mapped;
};

const loadFromLocalStorage = () => {
  try {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("queue_ins_types");
    if (!raw) return;
    const parsed = JSON.parse(raw);
    queueInsTypeConfigs = mapQueueInsTypesToConfig(parsed);
  } catch (e) {
    // Ignore
  }
};

const fetchFromDatabase = async () => {
  try {
    // Use any to bypass strict typing, align with other hooks in project
    const { data, error } = await (supabase as any)
      .from("queue_ins_types")
      .select("code, prefix, format")
      .order("id", { ascending: true });
    if (error) throw error;
    if (data) {
      queueInsTypeConfigs = mapQueueInsTypesToConfig(data);
    }
  } catch (e) {
    // Fail silently; fallback logic will handle missing configs
    console.warn(
      "Failed to fetch queue INS type formats from DB, using fallback/local cache"
    );
  }
};

// Initialize configs from localStorage and refresh from DB in the background
(() => {
  try {
    loadFromLocalStorage();
    // Fire-and-forget refresh; do not block app startup
    void fetchFromDatabase();
  } catch {
    // Ignore
  }
})();

// Format the queue number with the type prefix for INS queues
export const formatQueueInsNumber = (
  queueType: string | undefined,
  queueNumber: number | undefined
): string => {
  if (!queueNumber) return "-";
  
  // Get the format configuration for this queue type
  const format = queueType ? queueInsTypeConfigs[queueType] : undefined;

  // If format is not found, use a default format
  if (!format) {
    const defaultPrefix = queueType?.charAt(0) || "I"; // Use first letter or 'I' as fallback
    return `${defaultPrefix}${queueNumber.toString().padStart(3, "0")}`;
  }

  return `${format.prefix}${queueNumber
    .toString()
    .padStart(format.padLength, "0")}`;
};

// Calculate waiting time in minutes
export const calculateInsWaitingTime = (
  createdAt: string,
  calledAt?: string
): string => {
  if (!createdAt || !calledAt) return "?";

  const createdTime = new Date(createdAt).getTime();
  const calledTime = new Date(calledAt).getTime();
  const diffMinutes = Math.round((calledTime - createdTime) / (1000 * 60));

  return `${diffMinutes} นาที`;
};

// Calculate service time in minutes
export const calculateInsServiceTime = (
  calledAt?: string,
  completedAt?: string
): string => {
  if (!calledAt || !completedAt) return "?";

  const calledTime = new Date(calledAt).getTime();
  const completedTime = new Date(completedAt).getTime();
  const diffMinutes = Math.round((completedTime - calledTime) / (1000 * 60));

  return `${diffMinutes} นาที`;
};
