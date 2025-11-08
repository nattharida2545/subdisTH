import { BASE_URL } from "@/config/constants";
import { formatQueueNumber } from "@/utils/queueFormatters";
import { createLogger } from "@/utils/logger";
import { PrintQueueTicketINSOptions } from "./PrintQueueTicketINS";
import { formatQueueInsNumber } from "@/utils/queueInsFormatters";

// Constants specific to INS printing
const QR_CODE_SCRIPT_URL =
  "https://cdn.rawgit.com/davidshimjs/qrcodejs/gh-pages/qrcode.min.js";

const INS_PRINT_STYLES = `
  body {
    font-family: 'Sukhumvit Set', 'Prompt', system-ui, sans-serif;
    padding: 20px;
    text-align: center;
  }
  .header {
    margin-bottom: 15px;
    font-size: 20px;
    font-weight: bold;
    color: #333;
  }
  .queue-info {
    margin: 16px 0;
    font-size: 18px;
    font-weight: bold;
  }
  .queue-number {
    font-size: 72px;
    font-weight: bold;
    color: #0f766e;
    margin: 20px 0;
    padding: 10px;
    border: 2px dashed #0f766e;
    border-radius: 10px;
    display: inline-block;
  }
  .patient-info {
    margin: 8px 0;
    font-size: 16px;
  }
  .purpose-info {
    margin: 12px 0;
    font-size: 18px;
    color: #444;
    font-weight: 500;
  }
  .qr-container {
    margin: 20px auto;
    width: 200px;
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .wait-time {
    margin: 12px 0;
    font-size: 16px;
    padding: 6px 14px;
    background-color: #f0f9ff;
    border: 1px solid #bae6fd;
    border-radius: 6px;
    color: #0369a1;
    display: inline-block;
  }
  .footer {
    margin-top: 20px;
    font-size: 14px;
    color: #666;
  }
  .hospital-name {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 5px;
  }
  @media print {
    body {
      margin: 0;
      padding: 15px;
    }
    .queue-number {
      font-size: 68px;
    }
    .wait-time {
      background-color: #f0f9ff !important;
      border-color: #bae6fd !important;
      color: #0369a1 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    /* Force print background colors and images */
    * {
      -webkit-print-color-adjust: exact !important;
      color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
  }
`;

const logger = createLogger("generatePrintContentINS");

/**
 * Generates HTML content for printing INS queue tickets
 * This is a specialized version for the QueueCreateINS page
 */
export function generatePrintContentINS(
  options: PrintQueueTicketINSOptions
): string {
  const {
    queueNumber,
    phoneNumber = "",
    purpose = "ตรวจทั่วไป",
    estimatedWaitTime = 15,
    waitTiemQueueNext = 0,
    queueType,
  } = options;

  const formattedQueueNumber = formatQueueInsNumber(
    queueType as any,
    queueNumber
  );

  // Create the QR code URL for tracking the queue
  const patientPortalUrl = `${BASE_URL}/patient-portal`;
  logger.debug(`Generated QR URL: ${patientPortalUrl}`);
  console.log(`Generated QR URL for INS: ${patientPortalUrl}`);

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
          ${INS_PRINT_STYLES}
        </style>
      </head>
      <body>
        <div class="header">คิวเข้าตรวจ</div>
        
        <div class="queue-number">${formattedQueueNumber}</div>
        
        <div class="purpose-info">🏥 ${purpose}</div>
        
        ${
          phoneNumber
            ? `<div class="patient-info">📱 เบอร์โทร: ${phoneNumber}</div>`
            : ""
        }
        
        ${
          waitTiemQueueNext
            ? `<div class="wait-time">⏱️ เวลารอโดยประมาณ: ${waitTiemQueueNext} นาที</div>`
            : ""
        }
        
        <div class="queue-info">
          วันที่: ${currentDate}
        </div>
        <div class="queue-info">
          เวลา: ${currentTime}
        </div>
        
        <!-- QR Code for patient portal -->
        <div class="qr-container">
          <div id="qrcode"></div>
          </div>
          <p class="qr-text">สแกนเพื่อติดตามคิว</p>

        <div class="footer">
          <div class="hospital-name">โรงพยาบาลส่งเสริมสุขภาพตำบลหนองแวง</div>
          <p>ขอบคุณที่ใช้บริการ</p>
        </div>
        
        <script>
          // Generate QR code when the page loads
          window.onload = function() {
            new QRCode(document.getElementById("qrcode"), {
              text: "${patientPortalUrl}",
              width: 128,
              height: 128,
              colorDark: "#000000",
              colorLight: "#ffffff",
              correctLevel: QRCode.CorrectLevel.H
            });
          }
        </script>
      </body>
    </html>
  `;
}
