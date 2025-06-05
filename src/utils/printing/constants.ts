
// Default styles for queue ticket printing
export const DEFAULT_PRINT_STYLES = `
  body {
    font-family: 'Sukhumvit Set', 'Prompt', system-ui, sans-serif;
    padding: 20px;
    text-align: center;
  }
  .patient-header {
    margin-bottom: 10px;
    font-size: 18px;
    font-weight: bold;
  }
  .queue-info {
    margin: 16px 0;
    font-size: 18px;
    font-weight: bold;
  }
  .queue-number {
    font-size: 64px;
    font-weight: bold;
    color: #158a7b;
    margin: 20px 0;
  }
  .patient-info {
    margin: 8px 0;
    font-size: 16px;
  }
  .purpose-info {
    margin: 10px 0;
    font-size: 16px;
    color: #555;
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
    padding: 4px 12px;
    background-color: #f0f9ff;
    border: 1px solid #bae6fd;
    border-radius: 4px;
    color: #0369a1;
    display: inline-block;
  }
  .footer {
    margin-top: 30px;
    font-size: 14px;
    color: #666;
  }
  .icon {
    display: inline-block;
    width: 16px;
    height: 16px;
    margin-right: 4px;
    vertical-align: middle;
  }
  @media print {
    body {
      margin: 0;
      padding: 15px;
    }
    .queue-number {
      font-size: 60px;
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

export const QR_CODE_SCRIPT_URL = "https://cdn.rawgit.com/davidshimjs/qrcodejs/gh-pages/qrcode.min.js";
