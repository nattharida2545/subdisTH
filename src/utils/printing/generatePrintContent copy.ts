import { BASE_URL } from "@/config/constants";
import { formatQueueNumber } from "@/utils/queueFormatters";
import { PrintQueueOptions } from "./types";
import { DEFAULT_PRINT_STYLES, QR_CODE_SCRIPT_URL } from "./constants";
import { createLogger } from "@/utils/logger";

const logger = createLogger("generatePrintContent");

export function generatePrintContent(options: PrintQueueOptions): string {
  const {
    queueNumber,
    queueType,
    patientName = "",
    patientPhone = "",
    patientLineId = "",
    purpose = "",
    estimatedWaitTime = 15,
    waitTiemQueueNext = 0,
  } = options;

  const formattedQueueNumber = formatQueueNumber(queueType, queueNumber);

  // Create the QR code URL for tracking the queue
  const patientPortalUrl = `${BASE_URL}/patient-portal?queue=${queueNumber}${
    queueType ? `&type=${queueType}` : ""
  }`;
  logger.debug(`Generated QR URL: ${patientPortalUrl}`);

  const currentDate = new Date().toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const currentTime = new Date().toLocaleTimeString("th-TH");

  logger.debug(`Formatted date and time: ${currentDate} ${currentTime}`);

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>คิวหมายเลข ${formattedQueueNumber}</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="${QR_CODE_SCRIPT_URL}"></script>
        <style>
          ${DEFAULT_PRINT_STYLES}
        </style>
      </head>
      <body>
        <h2>คิวรับยา</h2>
        ${patientName ? `<div class="patient-header">${patientName}</div>` : ""}
        ${
          patientPhone
            ? `<div class="patient-info">📱 ${patientPhone}</div>`
            : ""
        }
        
        <div class="queue-number">${formattedQueueNumber}</div>
        
        ${
          waitTiemQueueNext
            ? `<div class="wait-time">⏱️ เวลารอโดยประมาณ: ${waitTiemQueueNext} นาที</div>`
            : ""
        }
        
        ${
          patientLineId
            ? `<div class="patient-info">💬 LINE ID: ${patientLineId}</div>`
            : ""
        }
        ${
          purpose
            ? `<div class="purpose-info">วัตถุประสงค์: ${purpose}</div>`
            : ""
        }
        
        <div class="queue-info">
          วันที่: ${currentDate}
        </div>
        <div class="queue-info">
          เวลา: ${currentTime}
        </div>
        
        <p>สแกน QR Code เพื่อติดตามคิวบน LINE</p>
        <div id="qrcode" class="qr-container"></div>
        
        <div class="footer">
          <p>ขอบคุณที่ใช้บริการ</p>
        </div>
        
        <script>
          console.log('[PrintWindow] Print script initialized');
          
          // Generate QR Code when window loads
          window.onload = function() {
            console.log('[PrintWindow] Window loaded, generating QR code...');
            
            try {
              // Create QR code
              new QRCode(document.getElementById("qrcode"), {
                text: "${patientPortalUrl}",
                width: 180,
                height: 180,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.L
              });
              
              console.log('[PrintWindow] QR code generated');
              
              // Small delay to ensure content and QR code are properly rendered before printing
              setTimeout(() => {
                console.log('[PrintWindow] Triggering browser print dialog');
                try {
                  window.print();
                  console.log('[PrintWindow] Print triggered successfully');
                } catch (e) {
                  console.error('[PrintWindow] Error during print:', e);
                }
                
                // Close after printing or after 10 seconds
                setTimeout(() => {
                  console.log('[PrintWindow] Closing print window');
                  window.close();
                }, 10000);
              }, 800); // Increased delay to ensure QR code renders
            } catch (err) {
              console.error('[PrintWindow] Error generating QR code:', err);
            }
          }
        </script>
      </body>
    </html>
  `;
}
