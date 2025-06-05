
import { createLogger } from '@/utils/logger';
import { PrintQueueOptions } from './types';
import { generatePrintContent } from './generatePrintContent';
import { formatQueueNumber } from '@/utils/queueFormatters';

const logger = createLogger('printQueue');

/**
 * Opens a new window with queue ticket content and triggers the print dialog
 */
export function printQueueTicket(options: PrintQueueOptions): void {
  const { queueNumber, queueType } = options;
  const formattedQueueNumber = formatQueueNumber(queueType, queueNumber);
  
  logger.debug(`----------------------------------------`);
  logger.debug(`🖨️🖨️🖨️ PRINT QUEUE TICKET FUNCTION CALLED 🖨️🖨️🖨️`);
  logger.debug(`----------------------------------------`);
  logger.debug(`[printQueueTicket] Queue details:`, options);
  
  try {
    // Create a new window with just the content we want to print
    logger.debug(`[printQueueTicket] Opening new window for printing`);
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      logger.error('[printQueueTicket] Popup blocked. Please allow popups for printing');
      alert('โปรดอนุญาตให้เปิด popup เพื่อพิมพ์บัตรคิว');
      return;
    }

    // Generate the HTML content for printing
    const printContent = generatePrintContent(options);

    // Write the content to the new window and trigger print
    logger.debug('[printQueueTicket] Writing content to print window');
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    logger.debug('[printQueueTicket] Print window opened and content written');
  } catch (error) {
    logger.error('[printQueueTicket] Error during printing process:', error);
    alert('เกิดข้อผิดพลาดในการพิมพ์บัตรคิว');
  }
}
