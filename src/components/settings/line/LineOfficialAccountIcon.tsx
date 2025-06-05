
import React from 'react';
import { Globe } from 'lucide-react';

const LineOfficialAccountIcon: React.FC = () => {
  return (
    <div className="text-center">
      <div className="w-24 h-24 mx-auto bg-green-100 rounded-xl flex items-center justify-center">
        <Globe className="h-12 w-12 text-green-600" />
      </div>
      <h3 className="mt-4 text-lg font-medium">LINE Official Account</h3>
      <p className="text-sm text-gray-500 mt-1">เชื่อมต่อระบบกับ LINE เพื่อเพิ่มประสิทธิภาพการสื่อสาร</p>
    </div>
  );
};

export default LineOfficialAccountIcon;
