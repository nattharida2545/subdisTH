
import React from 'react';

const SettingsLoading: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="animate-spin w-10 h-10 border-4 border-gray-300 border-t-pharmacy-600 rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">กำลังโหลดข้อมูลการตั้งค่า...</p>
      </div>
    </div>
  );
};

export default SettingsLoading;
