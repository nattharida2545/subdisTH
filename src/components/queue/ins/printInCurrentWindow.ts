import { createLogger } from '@/utils/logger';
import { toast } from 'sonner';
import { PrintQueueTicketINSOptions } from './PrintQueueTicketINS';

const logger = createLogger('printInCurrentWindow');

/**
 * Creates a hidden iframe in the current page and prints the content
 * This avoids opening a new tab and prints directly from the current window
 */
export function printInCurrentWindow(htmlContent: string): void {
  try {
    logger.debug(`[printInCurrentWindow] Creating hidden iframe for printing`);
    
    // Remove any existing print frames
    const existingFrame = document.getElementById('print-frame');
    if (existingFrame) {
      existingFrame.remove();
    }
    
    // Create a hidden iframe
    const iframe = document.createElement('iframe');
    iframe.id = 'print-frame';
    iframe.style.position = 'fixed';
    iframe.style.right = '-999999px';
    iframe.style.bottom = '-999999px';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    
    // Append the iframe to the document
    document.body.appendChild(iframe);
    
    // Get the iframe document
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    
    if (!iframeDoc) {
      throw new Error('Could not access iframe document');
    }
    
    // Write the content to the iframe
    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();
    
    // Wait for the iframe to load before printing
    iframe.onload = () => {
      try {
        logger.debug(`[printInCurrentWindow] Iframe loaded, triggering print`);
        
        // Focus the iframe (required for some browsers)
        if (iframe.contentWindow) {
          iframe.contentWindow.focus();
        }
        
        // Trigger print
        setTimeout(() => {
          if (iframe.contentWindow) {
            iframe.contentWindow.print();
            logger.debug(`[printInCurrentWindow] Print triggered successfully`);
            
            // Remove the iframe after a delay
            setTimeout(() => {
              iframe.remove();
              logger.debug(`[printInCurrentWindow] Print frame removed`);
            }, 5000);
          }
        }, 500);
      } catch (error) {
        logger.error(`[printInCurrentWindow] Error during print:`, error);
        toast.error('เกิดข้อผิดพลาดในการพิมพ์บัตรคิว', { id: "print-ticket-error" });
        iframe.remove();
      }
    };
    
    toast.success('กำลังพิมพ์บัตรคิว', { id: "print-ticket" });
  } catch (error) {
    logger.error(`[printInCurrentWindow] Error setting up print:`, error);
    toast.error('เกิดข้อผิดพลาดในการพิมพ์บัตรคิว', { id: "print-ticket-error" });
  }
}
