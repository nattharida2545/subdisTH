
import React from 'react';
import { 
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Check, Clock } from 'lucide-react';

interface QueueCreatedHeaderProps {
  purpose?: string;
  estimatedWaitTime?: number;
}

const QueueCreatedHeader: React.FC<QueueCreatedHeaderProps> = ({ 
  purpose,
  estimatedWaitTime = 15 
}) => {
  return (
    <DialogHeader className="space-y-3">
      <DialogTitle className="text-center flex items-center justify-center gap-2">
        <Check className="h-5 w-5 text-green-500" />
        <span>สร้างคิวเรียบร้อยแล้ว</span>
      </DialogTitle>
      
      {purpose && (
        <DialogDescription className="text-center text-sm">
          {purpose}
        </DialogDescription>
      )}
      
      <div className="mt-2 flex items-center justify-center text-gray-600 text-sm">
        <Clock className="h-4 w-4 mr-1 text-pharmacy-500" />
        <span>เวลารอโดยประมาณ: {estimatedWaitTime} นาที</span>
      </div>
    </DialogHeader>
  );
};

export default QueueCreatedHeader;
