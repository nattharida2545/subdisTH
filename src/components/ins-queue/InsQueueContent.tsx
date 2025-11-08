import React from "react";
import { ServicePointIns } from "@/integrations/supabase/schema";
import InsQueuePanel from "./InsQueuePanel";

interface InsQueueContentProps {
  selectedServicePoint: ServicePointIns;
  refreshTrigger: number;
}

const InsQueueContent: React.FC<InsQueueContentProps> = ({
  selectedServicePoint,
  refreshTrigger,
}) => {
  return (
    <div className="h-full p-6">
      <InsQueuePanel
        servicePointId={selectedServicePoint.id}
        title={`บริการตรวจสอบสิทธิ์ - ${selectedServicePoint.name}`}
        refreshTrigger={refreshTrigger}
      />
    </div>
  );
};

export default InsQueueContent;
