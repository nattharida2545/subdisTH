
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QueueType } from '@/integrations/supabase/schema';
import { BASE_URL } from '@/config/constants';

interface LineQRCodeProps {
  queueNumber: number;
  queueType?: string | QueueType;
  size?: number;
  className?: string;
}

const LineQRCode: React.FC<LineQRCodeProps> = ({ 
  queueNumber, 
  queueType, 
  size = 150,
  className 
}) => {
  const patientPortalUrl = `${BASE_URL}/patient-portal?queue=${queueNumber}${queueType ? `&type=${queueType}` : ''}`;
  
  return (
    <div className={`flex flex-col items-center ${className || ''}`}>
      <QRCodeSVG
        value={patientPortalUrl}
        size={size}
        bgColor={"#ffffff"}
        fgColor={"#000000"}
        level={"L"}
        includeMargin={false}
      />
      <div className="text-xs text-gray-500 mt-1">LINE QR Code</div>
    </div>
  );
};

export default LineQRCode;
