import React from "react";
import { Loader2 } from "lucide-react";

const InsQueueLoading = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
    </div>
  );
};

export default InsQueueLoading;
