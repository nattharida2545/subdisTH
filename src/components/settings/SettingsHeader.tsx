
import React from 'react';

const SettingsHeader: React.FC = () => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">ตั้งค่าระบบ</h1>
        <p className="text-gray-500">จัดการการตั้งค่าระบบคิวและห้องยา</p>
      </div>
    </div>
  );
};

export default SettingsHeader;
