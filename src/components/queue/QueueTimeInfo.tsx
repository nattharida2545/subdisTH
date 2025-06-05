
import React from 'react';
import { Queue } from '@/integrations/supabase/schema';
import { formatRelativeTime } from '@/utils/dateUtils';
import { Clock } from 'lucide-react';

export interface QueueTimeInfoProps {
  queue: Queue;
}

const QueueTimeInfo: React.FC<QueueTimeInfoProps> = ({ queue }) => {
  return (
    <div className="text-sm text-gray-500 flex items-center">
      <Clock className="h-4 w-4 mr-1" />
      <span>{formatRelativeTime(queue.created_at)}</span>
    </div>
  );
};

export default QueueTimeInfo;
