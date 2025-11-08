import { createLogger } from "@/utils/logger";
import { toast } from "sonner";
import { generatePrintContentINS } from "./generatePrintContentINS";
import { printInCurrentWindow } from "./printInCurrentWindow";

const logger = createLogger("PrintQueueTicketINS");

/**
 * Interface for PrintQueueTicketINS options specific to the INS queue
 */
export interface PrintQueueTicketINSOptions {
  queueNumber: number;
  phoneNumber: string;
  purpose?: string;
  estimatedWaitTime?: number;
  waitTiemQueueNext?: number;
  queueType: string;
}

/**
 * Opens a new window with INS queue ticket content and triggers the print dialog
 * This is a specialized version for the QueueCreateINS page
 */
export async function printQueueTicketINS(
  options: PrintQueueTicketINSOptions
): Promise<void> {
  const {
    queueNumber,
    phoneNumber,
    purpose = "ตรวจทั่วไป",
    estimatedWaitTime = 15,
    waitTiemQueueNext = 0,
    queueType,
  } = options;

  logger.debug(`----------------------------------------`);
  logger.debug(`🖨️🖨️🖨️ PRINT INS QUEUE TICKET FUNCTION CALLED 🖨️🖨️🖨️`);
  logger.debug(`----------------------------------------`);
  logger.debug(`[printQueueTicketINS] Queue details:`, options);

  try {
    // Generate the HTML content for printing using our specialized function
    logger.debug(`[printQueueTicketINS] Generating print content`);
    const printContent = await generatePrintContentINS(options);

    // Print in the current window using an iframe
    logger.debug("[printQueueTicketINS] Printing in current window");
    printInCurrentWindow(printContent);
    toast.success("กำลังพิมพ์บัตรคิว", { id: "print-ticket" });
  } catch (error) {
    logger.error("[printQueueTicketINS] Error during printing process:", error);
    toast.error("เกิดข้อผิดพลาดในการพิมพ์บัตรคิว", {
      id: "print-ticket-error",
    });
  }
}
