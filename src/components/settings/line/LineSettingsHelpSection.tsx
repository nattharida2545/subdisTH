
import React from 'react';
import { AlertCircle, ExternalLink } from 'lucide-react';

const LineSettingsHelpSection: React.FC = () => {
  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-md mb-4">
      <div className="flex">
        <AlertCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-medium text-blue-800">วิธีการรับข้อมูลสำหรับการตั้งค่า</h4>
          <p className="text-xs text-blue-600 mt-1">
            คุณสามารถค้นหาข้อมูล Channel ID, Channel Secret และ Access Token ได้จาก LINE Developer Console และ LINE Official Account Manager:
          </p>
          <ol className="list-decimal text-xs text-blue-600 mt-2 ml-5 space-y-1">
            <li>ไปที่ <a href="https://developers.line.biz" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline inline-flex items-center">LINE Developers <ExternalLink className="h-3 w-3 ml-1" /></a></li>
            <li>เข้าสู่โปรเจค/Provider ที่มี LINE Official Account ของคุณ</li>
            <li>เลือก Channel ของ Messaging API</li>
            <li>คุณจะพบ Channel ID และ Channel Secret</li>
            <li>สำหรับ Access Token ให้ไปที่ <a href="https://manager.line.biz" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline inline-flex items-center">LINE Official Account Manager <ExternalLink className="h-3 w-3 ml-1" /></a></li>
            <li>เลือก Official Account ของคุณ</li>
            <li>ไปที่ Settings &gt; Messaging API</li>
            <li>ดูที่ส่วน &quot;Channel access token (long-lived)&quot; และสร้างหรือคัดลอก Token</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default LineSettingsHelpSection;
