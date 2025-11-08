import React from "react";
import { HospitalIcon } from "lucide-react";

const InsQueueEmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">
      <div className="bg-gray-100 p-4 rounded-full mb-4">
        <HospitalIcon className="h-10 w-10 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">
        เลือกจุดบริการเพื่อดูคิว
      </h3>
      <p className="text-gray-500 max-w-sm">
        กรุณาเลือกจุดบริการจากเมนูด้านบนเพื่อแสดงรายการคิวที่รอเข้าตรวจ
      </p>
    </div>
  );
};

export default InsQueueEmptyState;
