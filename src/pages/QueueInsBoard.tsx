import React, { useState, useEffect } from 'react';
import QueueInsBoardContainer from '@/components/ins-queue/board/QueueInsBoardContainer';
import QueuePageHeader from '@/components/queue/QueuePageHeader';
import HospitalFooter from '@/components/queue/HospitalFooter';

const QueueInsBoard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  
  return (
    <div className="min-h-screen bg-pharmacy-50 flex flex-col">
      <QueuePageHeader 
        currentTime={currentTime}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        title="ระบบแสดงคิวตรวจ"
      />
      
      <div className="flex-1">
        <QueueInsBoardContainer />
      </div>
      
      <div className="mt-auto">
        <HospitalFooter />
      </div>
    </div>
  );
};

export default QueueInsBoard;