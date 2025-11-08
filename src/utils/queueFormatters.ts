import { QueueType } from "@/integrations/supabase/schema";
import { supabase } from "@/integrations/supabase/client";

// Queue type format configuration loaded from database/local cache
type QueueTypeFormatConfig = { prefix: string; padLength: number };
let queueTypeConfigs: Record<string, QueueTypeFormatConfig> = {};

const parsePadLength = (fmt: unknown): number => {
  if (typeof fmt === "string") return fmt.length || 3; // e.g. '000' -> 3
  if (typeof fmt === "number") return fmt || 3;
  return 3;
};

const mapQueueTypesToConfig = (
  items: any[]
): Record<string, QueueTypeFormatConfig> => {
  const mapped: Record<string, QueueTypeFormatConfig> = {};
  for (const item of items || []) {
    const code: string | undefined = item?.code;
    if (!code) continue;
    const prefix: string = (item?.prefix || code.charAt(0) || "Q").toString();
    const padLength = parsePadLength(item?.format);
    mapped[code as QueueType] = { prefix, padLength };
  }
  return mapped;
};

const loadFromLocalStorage = () => {
  try {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("queue_types");
    if (!raw) return;
    const parsed = JSON.parse(raw);
    queueTypeConfigs = mapQueueTypesToConfig(parsed);
  } catch (e) {
    // Ignore
  }
};

const fetchFromDatabase = async () => {
  try {
    // Use any to bypass strict typing, align with other hooks in project
    const { data, error } = await (supabase as any)
      .from("queue_types")
      .select("code, prefix, format")
      .order("priority", { ascending: false });

    const { data: queueTypesIns } = await (supabase as any)
      .from("queue_ins_types")
      .select("code, prefix, format");

    if (error) throw error;
    if (data && queueTypesIns) {
      queueTypeConfigs = mapQueueTypesToConfig([...data, ...queueTypesIns]);
    }
  } catch (e) {
    // Fail silently; fallback logic will handle missing configs
    console.warn(
      "Failed to fetch queue type formats from DB, using fallback/local cache"
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

// Format the queue number with the type prefix
export const formatQueueNumber = (
  queueType: any,
  queueNumber: number
): string => {
  // Get the format configuration for this queue type
  console.log("queueType", queueType);
  console.log("queueNumber", queueNumber);
  const format = queueTypeConfigs[queueType];

  console.log("format:", format);

  // If format is not found, use a default format
  if (!format) {
    console.warn(
      `Queue type format not found for: ${queueType}, using default format`
    );
    const defaultPrefix = queueType?.charAt(0) || "Q"; // Use first letter or 'Q' as fallback
    return `${defaultPrefix}${queueNumber.toString().padStart(3, "0")}`;
  }

  return `${format.prefix}${queueNumber
    .toString()
    .padStart(format.padLength, "0")}`;
};

// Calculate waiting time in minutes
export const calculateWaitingTime = (
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
export const calculateServiceTime = (
  calledAt?: string,
  completedAt?: string
): string => {
  if (!calledAt || !completedAt) return "?";

  const calledTime = new Date(calledAt).getTime();
  const completedTime = new Date(completedAt).getTime();
  const diffMinutes = Math.round((completedTime - calledTime) / (1000 * 60));

  return `${diffMinutes} นาที`;
};
