
import React, { useState, useEffect } from 'react';
import QueueBoardContainer from '@/components/queue/board/QueueBoardContainer';
import QueuePageHeader from '@/components/queue/QueuePageHeader';
import QueueBoardAlgorithmInfo from '@/components/queue/board/QueueBoardAlgorithmInfo';
import HospitalFooter from '@/components/queue/HospitalFooter';
import { QueueAlgorithmType } from '@/utils/queueAlgorithms';

const QueueBoard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentAlgorithm, setCurrentAlgorithm] = useState<QueueAlgorithmType>(QueueAlgorithmType.FIFO);
  
  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Load algorithm from localStorage
  useEffect(() => {
    const savedAlgorithm = localStorage.getItem('queue_algorithm');
    if (savedAlgorithm) {
      setCurrentAlgorithm(savedAlgorithm as QueueAlgorithmType);
    }
  }, []);
  
  // Get the current algorithm name for display
  const getCurrentAlgorithmName = () => {
    switch (currentAlgorithm) {
      case QueueAlgorithmType.FIFO: return "First In, First Out (FIFO)";
      case QueueAlgorithmType.PRIORITY: return "ลำดับความสำคัญ (Priority Queue)";
      case QueueAlgorithmType.MULTILEVEL: return "หลายระดับ (Multilevel Queue)";
      case QueueAlgorithmType.MULTILEVEL_FEEDBACK: return "ปรับความสำคัญตามเวลารอคอย (Multilevel Feedback)";
      default: return "อัลกอริทึมเรียกคิว";
    }
  };
  
  return (
    <div className="min-h-screen bg-pharmacy-50 flex flex-col">
      <QueuePageHeader 
        currentTime={currentTime}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        title="ระบบแสดงคิวห้องยา"
      />
      
      <QueueBoardAlgorithmInfo algorithmName={getCurrentAlgorithmName()} />
      
      <div className="flex-1">
        <QueueBoardContainer />
      </div>
      
      <div className="mt-auto">
        <HospitalFooter />
      </div>
    </div>
  );
};

export default QueueBoard;
