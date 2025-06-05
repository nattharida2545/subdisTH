
import { formatQueueNumber } from '@/utils/queueFormatters';
import { QueueTypeEnum } from '@/integrations/supabase/schema';

// Thai phonetic mappings for service point codes
const thaiLetterMap: { [key: string]: string } = {
  'A': 'เอ', 'B': 'บี', 'C': 'ซี', 'D': 'ดี', 'E': 'อี', 'F': 'เอฟ', 'G': 'จี', 'H': 'เอช',
  'I': 'ไอ', 'J': 'เจ', 'K': 'เค', 'L': 'แอล', 'M': 'เอ็ม', 'N': 'เอ็น', 'O': 'โอ', 'P': 'พี',
  'Q': 'คิว', 'R': 'อาร์', 'S': 'เอส', 'T': 'ที', 'U': 'ยู', 'V': 'วี', 'W': 'ดับเบิลยู', 'X': 'เอ็กซ์',
  'Y': 'วาย', 'Z': 'แซด',
  '0': 'ศูนย์', '1': 'หนึ่ง', '2': 'สอง', '3': 'สาม', '4': 'สี่', '5': 'ห้า',
  '6': 'หก', '7': 'เจ็ด', '8': 'แปด', '9': 'เก้า'
};

/**
 * Convert service point code to Thai phonetics
 */
export function convertServicePointCodeToThai(code: string): string {
  if (!code) return '';
  
  return code.split('').map(char => {
    const upperChar = char.toUpperCase();
    return thaiLetterMap[upperChar] || char;
  }).join(' ');
}

/**
 * Convert formatted queue number to Thai phonetics (each character individually)
 */
export function convertQueueNumberToThai(formattedQueueNumber: string): string {
  if (!formattedQueueNumber) return '';
  
  return formattedQueueNumber.split('').map(char => {
    const upperChar = char.toUpperCase();
    return thaiLetterMap[upperChar] || char;
  }).join(' ');
}

/**
 * Create service point announcement message
 */
export function createServicePointAnnouncement(servicePointInfo: { code?: string; name?: string } | string): string {
  if (typeof servicePointInfo === 'string') {
    // Legacy support - treat as counter name
    return `ที่ช่องบริการ ${servicePointInfo}`;
  }
  
  if (servicePointInfo && (servicePointInfo.code || servicePointInfo.name)) {
    let servicePointParts = [];
    
    if (servicePointInfo.code) {
      const thaiCode = convertServicePointCodeToThai(servicePointInfo.code);
      servicePointParts.push(thaiCode);
    }
    
    if (servicePointInfo.name) {
      servicePointParts.push(servicePointInfo.name);
    }
    
    return `ที่ ${servicePointParts.join(' ')}`;
  }
  
  // Fallback to default
  return 'ที่ช่องบริการ หนึ่ง';
}

/**
 * Create full queue announcement message
 */
export function createQueueAnnouncementMessage(
  queueNumber: number,
  servicePointInfo: { code?: string; name?: string } | string,
  queueType?: string
): string {
  try {
    // Convert string to QueueTypeEnum if needed, with fallback
    const validQueueType = (queueType as QueueTypeEnum) || 'GENERAL';
    
    // Format the queue number properly (e.g., A105, B001)
    const formattedQueueNumber = formatQueueNumber(validQueueType, queueNumber);
    
    // Convert formatted queue number to Thai phonetics (each digit individually)
    const phoneticQueueNumber = convertQueueNumberToThai(formattedQueueNumber);
    
    // Create service point message
    const servicePointMessage = createServicePointAnnouncement(servicePointInfo);
    
    // Create the announcement message (removed "เชิญครับ")
    return `ขอเชิญหมายเลข ${phoneticQueueNumber} ${servicePointMessage}`;
  } catch (error) {
    console.error('Error creating queue announcement message:', error);
    // Fallback to simple announcement
    return `ขอเชิญหมายเลข ${queueNumber}`;
  }
}
