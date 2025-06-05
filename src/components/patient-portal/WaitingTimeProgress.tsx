
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Clock, AlertCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface WaitingTimeProgressProps {
  position: number | null;
  totalWaiting: number;
  estimatedTimeMinutes: number | null;
  className?: string;
}

const WaitingTimeProgress: React.FC<WaitingTimeProgressProps> = ({
  position,
  totalWaiting,
  estimatedTimeMinutes,
  className,
}) => {
  const isMobile = useIsMobile();
  
  // If we don't have position data yet
  if (position === null || totalWaiting === 0) {
    return (
      <div className={`text-center p-4 ${className}`}>
        <AlertCircle className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
        <p className="text-gray-600">กำลังคำนวณเวลารอโดยประมาณ...</p>
      </div>
    );
  }

  // Calculate progress percentage
  const progressPercentage = Math.max(0, Math.min(100, 100 - (position / totalWaiting * 100)));
  
  // Format estimated time display
  const formatTimeRemaining = (minutes: number | null) => {
    if (minutes === null) return 'กำลังคำนวณ...';
    if (minutes < 1) return 'น้อยกว่า 1 นาที';
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.floor(minutes % 60);
    
    if (hours > 0) {
      return `${hours} ชั่วโมง ${remainingMinutes > 0 ? `${remainingMinutes} นาที` : ''}`;
    }
    return `${remainingMinutes} นาที`;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center text-sm">
          <Clock className="h-4 w-4 mr-1 text-blue-500" />
          <span>ตำแหน่งคิวปัจจุบัน:</span>
        </div>
        <span className="font-bold text-lg text-blue-600">{position} / {totalWaiting}</span>
      </div>
      
      <Progress value={progressPercentage} className="h-3 w-full" />
      
      <div className="flex justify-between text-sm text-gray-500">
        <span>รออยู่</span>
        <span>ใกล้ถึงคิว</span>
      </div>
      
      {estimatedTimeMinutes !== null && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">เวลารอโดยประมาณ</p>
          <p className="text-xl font-bold text-pharmacy-600">
            {formatTimeRemaining(estimatedTimeMinutes)}
          </p>
        </div>
      )}
    </div>
  );
};

export default WaitingTimeProgress;
