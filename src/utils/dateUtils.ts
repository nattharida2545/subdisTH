/**
 * Utility functions for date formatting
 */

// Format date to Thai format (dd/mm/yyyy)
export function formatThaiDate(dateString?: string): string {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch (error) {
    return dateString;
  }
}

// Format date and time to Thai format
export function formatThaiDateTime(dateString?: string): string {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    return dateString;
  }
}

// Format time only
export function formatTime(dateString?: string): string {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    return dateString;
  }
}

// Format a timestamp relative to now (e.g., "5 mins ago", "just now", etc.)
export const formatRelativeTime = (timestamp: string | Date | null | undefined): string => {
  if (!timestamp) return '';
  
  const now = new Date();
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  
  // Time difference in milliseconds
  const diff = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diff / 60000);
  
  if (diffInMinutes < 1) {
    return 'เมื่อสักครู่';
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
