/**
 * Utility functions for date formatting
 */

// Format date to Thai format (dd/mm/yyyy)
export function formatThaiDate(dateString?: string): string {
  if (!dateString) return "-";

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch (error) {
    return dateString;
  }
}

// Format date and time to Thai format
export function formatThaiDateTime(dateString?: string): string {
  if (!dateString) return "-";

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    return dateString;
  }
}

// Format time only
export function formatTime(dateString?: string): string {
  if (!dateString) return "-";

  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    return dateString;
  }
}

// Format a timestamp relative to now (e.g., "5 mins ago", "just now", etc.)
export const formatRelativeTime = (
  timestamp: string | Date | null | undefined
): string => {
  if (!timestamp) return "";

  const now = new Date();
  const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;

  // Time difference in milliseconds
  const diff = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diff / 60000);

  if (diffInMinutes < 1) {
    return "เมื่อสักครู่";
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} นาทีที่แล้ว`;
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours} ชั่วโมงที่แล้ว`;
  } else {
    const days = Math.floor(diffInMinutes / 1440);
    return `${days} วันที่แล้ว`;
  }
};

// Get today's date in YYYY-MM-DD format
export const getTodayDate = (): string => {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return localDate.toISOString().split("T")[0];
};

// Check if a date string is today
export const isToday = (dateString: string): boolean => {
  const today = getTodayDate();
  const compareDate = dateString.split("T")[0]; // Handle both date and datetime strings
  return compareDate === today;
};

// Check if a queue was completed today
export const isCompletedToday = (
  completedAt: string | null,
  queueDate: string
): boolean => {
  if (completedAt) {
    return isToday(completedAt);
  }
  // Fallback to queue_date if completed_at is not available
  return isToday(queueDate);
};
