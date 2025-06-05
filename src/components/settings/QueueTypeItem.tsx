
import React from 'react';
import { QueueType } from '@/hooks/useQueueTypes';

interface QueueTypeItemProps {
  children: React.ReactNode;
}

const QueueTypeItem: React.FC<QueueTypeItemProps> = ({ children }) => {
  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      {children}
    </div>
  );
};

export default QueueTypeItem;
