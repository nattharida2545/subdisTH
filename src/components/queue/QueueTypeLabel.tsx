import React from "react";
import { QueueType } from "@/integrations/supabase/schema";
import { cn } from "@/lib/utils";
import { getQueueTypeLabel } from "@/utils/queueTypeUtils";

interface QueueTypeLabelProps {
  queueType: QueueType;
  className?: string;
}

const QueueTypeLabel: React.FC<QueueTypeLabelProps> = ({
  queueType,
  className,
}) => {
  const getQueueTypeClass = (type: QueueType) => {
    switch (type) {
      case "GENERAL":
        return "text-blue-600 bg-blue-50";
      case "URGENT":
        return "text-red-600 bg-red-50";
      case "ELDERLY":
        return "text-amber-600 bg-amber-50";
      case "APPOINTMENT":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <span
      className={cn(
        `px-2 py-1 rounded-full text-xs ${getQueueTypeClass(queueType)}`,
        className
      )}
    >
      {getQueueTypeLabel(queueType)}
    </span>
  );
};

export default QueueTypeLabel;
