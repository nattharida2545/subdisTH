
import React from 'react';
import { QueueType } from '@/integrations/supabase/schema';
import { cn } from '@/lib/utils';

interface QueueTypeLabelProps {
  queueType: QueueType;
  className?: string;
}

const QueueTypeLabel: React.FC<QueueTypeLabelProps> = ({ queueType, className }) => {
  const getQueueTypeLabel = (type: QueueType) => {
    switch (type) {
      case 'GENERAL': return 'ทั่วไป';
      case 'PRIORITY': return 'ด่วน';
      case 'ELDERLY': return 'ผู้สูงอายุ';
      case 'FOLLOW_UP': return 'ติดตามการใช้ยา';
      default: return 'ไม่ระบุ';
    }
  };
  
  const getQueueTypeClass = (type: QueueType) => {
    switch (type) {
      case 'GENERAL': return 'text-blue-600 bg-blue-50';
      case 'PRIORITY': return 'text-red-600 bg-red-50';
      case 'ELDERLY': return 'text-amber-600 bg-amber-50';
      case 'FOLLOW_UP': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <span className={cn(`px-2 py-1 rounded-full text-xs ${getQueueTypeClass(queueType)}`, className)}>
      {getQueueTypeLabel(queueType)}
    </span>
  );
};

export default QueueTypeLabel;
