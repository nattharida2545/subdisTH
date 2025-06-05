
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface StepOutTimerProps {
  queuePosition: number | null;
  estimatedCallTime: number | null; // in minutes
  onStepOut: (minutes: number) => Promise<void>;
  onStepIn: () => Promise<void>;
  className?: string;
}

const StepOutTimer: React.FC<StepOutTimerProps> = ({
  queuePosition,
  estimatedCallTime,
  onStepOut,
  onStepIn,
  className,
}) => {
  const [isSteppedOut, setIsSteppedOut] = useState(false);
  const [returnTime, setReturnTime] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [selectedDuration, setSelectedDuration] = useState<number>(15); // Default 15 minutes
  
  // Durations in minutes
  const availableDurations = [5, 10, 15, 20, 30];
  
  // Timer for countdown
  useEffect(() => {
    if (!isSteppedOut || !returnTime) return;
    
    const interval = setInterval(() => {
      const now = new Date();
      const diffMs = returnTime.getTime() - now.getTime();
      const diffMinutes = Math.ceil(diffMs / 60000);
      
      if (diffMinutes <= 0) {
        // Time to return
        setTimeLeft(0);
        toast.error('ได้เวลากลับมารอคิวแล้ว!', { 
          description: 'คุณควรกลับมาที่โรงพยาบาลเพื่อไม่พลาดคิวของคุณ' 
        });
      } else {
        setTimeLeft(diffMinutes);
      }
    }, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, [isSteppedOut, returnTime]);
  
  // Load stepped out state from localStorage
  useEffect(() => {
    const savedStepOutData = localStorage.getItem('stepOutData');
    if (savedStepOutData) {
      try {
        const { isOut, returnTimeStr } = JSON.parse(savedStepOutData);
        if (isOut && returnTimeStr) {
          setIsSteppedOut(true);
          const returnTime = new Date(returnTimeStr);
          setReturnTime(returnTime);
          
          // Calculate initial time left
          const now = new Date();
          const diffMs = returnTime.getTime() - now.getTime();
          const diffMinutes = Math.ceil(diffMs / 60000);
          
          if (diffMinutes <= 0) {
            // Already past return time
            handleStepIn();
          } else {
            setTimeLeft(diffMinutes);
          }
        }
      } catch (error) {
        console.error('Error parsing step out data:', error);
        localStorage.removeItem('stepOutData');
      }
    }
  }, []);
  
  const handleStepOut = async () => {
    try {
      // Calculate return time
      const now = new Date();
      const returnTime = new Date(now.getTime() + selectedDuration * 60000);
      setReturnTime(returnTime);
      setTimeLeft(selectedDuration);
      setIsSteppedOut(true);
      
      // Save to localStorage
      localStorage.setItem('stepOutData', JSON.stringify({
        isOut: true,
        returnTimeStr: returnTime.toISOString()
      }));
      
      // Call API to record step out
      await onStepOut(selectedDuration);
      
      toast.success('ลงทะเบียนออกไปชั่วคราวเรียบร้อยแล้ว', {
        description: `กรุณากลับมาภายใน ${selectedDuration} นาที`
      });
    } catch (error) {
      console.error('Error stepping out:', error);
      toast.error('เกิดข้อผิดพลาดในการลงทะเบียนออกไปชั่วคราว');
      setIsSteppedOut(false);
    }
  };
  
  const handleStepIn = async () => {
    try {
      setIsSteppedOut(false);
      setReturnTime(null);
      setTimeLeft(0);
      
      // Remove from localStorage
      localStorage.removeItem('stepOutData');
      
      // Call API to record step in
      await onStepIn();
      
      toast.success('ลงทะเบียนกลับมารอคิวเรียบร้อยแล้ว');
    } catch (error) {
      console.error('Error stepping in:', error);
      toast.error('เกิดข้อผิดพลาดในการลงทะเบียนกลับมารอคิว');
    }
  };
  
  // Don't show step out option if position is too close to being called
  const isTooCloseToCall = queuePosition !== null && queuePosition <= 3;
  
  // If position is too close to call, or already stepped out
  if (isTooCloseToCall && !isSteppedOut) {
    return (
      <Alert variant="destructive" className={`${className}`}>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>ใกล้ถึงคิวของคุณแล้ว</AlertTitle>
        <AlertDescription>
          คุณอยู่ในลำดับที่ {queuePosition} กรุณารอที่โรงพยาบาลเพื่อไม่พลาดคิวของคุณ
        </AlertDescription>
      </Alert>
    );
  }
  
  if (isSteppedOut) {
    return (
      <Alert variant="default" className={`bg-yellow-50 border-yellow-200 text-yellow-800 ${className}`}>
        <Clock className="h-4 w-4 text-yellow-600" />
        <AlertTitle>คุณได้ลงทะเบียนออกไปชั่วคราว</AlertTitle>
        <AlertDescription className="space-y-4">
          <p>กรุณากลับมาภายใน {timeLeft} นาที</p>
          <Button 
            variant="outline" 
            className="w-full bg-white hover:bg-yellow-50" 
            onClick={handleStepIn}
          >
            ฉันกลับมาแล้ว
          </Button>
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-sm font-medium">ลงทะเบียนออกไปชั่วคราว</h3>
      <p className="text-xs text-gray-500">
        คุณสามารถออกไปทำธุระชั่วคราวและกลับมาเมื่อใกล้ถึงคิวของคุณ
      </p>
      
      <div className="flex flex-wrap gap-2">
        {availableDurations.map(duration => (
          <Button
            key={duration}
            variant={selectedDuration === duration ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedDuration(duration)}
            className="flex-1"
          >
            {duration} นาที
          </Button>
        ))}
      </div>
      
      <Button 
        variant="default" 
        className="w-full" 
        onClick={handleStepOut}
      >
        ออกไปชั่วคราว {selectedDuration} นาที
      </Button>
    </div>
  );
};

export default StepOutTimer;
