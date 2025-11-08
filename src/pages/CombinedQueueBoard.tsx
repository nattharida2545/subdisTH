import React, { useState, useEffect } from "react";
import QueueBoardContainer from "@/components/queue/board/QueueBoardContainer";
import QueueInsBoardContainer from "@/components/ins-queue/board/QueueInsBoardContainer";
import QueuePageHeader from "@/components/queue/QueuePageHeader";
import QueueBoardAlgorithmInfo from "@/components/queue/board/QueueBoardAlgorithmInfo";
import HospitalFooter from "@/components/queue/HospitalFooter";
import { QueueAlgorithmType } from "@/utils/queueAlgorithms";

const CombinedQueueBoard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentAlgorithm, setCurrentAlgorithm] = useState<QueueAlgorithmType>(
    QueueAlgorithmType.FIFO
  );

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Load algorithm from localStorage
  useEffect(() => {
    const savedAlgorithm = localStorage.getItem("queue_algorithm");
    if (savedAlgorithm) {
      setCurrentAlgorithm(savedAlgorithm as QueueAlgorithmType);
    }
  }, []);

  // Get the current algorithm name for display
  const getCurrentAlgorithmName = () => {
    switch (currentAlgorithm) {
      case QueueAlgorithmType.FIFO:
        return "First In, First Out (FIFO)";
      case QueueAlgorithmType.PRIORITY:
        return "ลำดับความสำคัญ (Priority Queue)";
      case QueueAlgorithmType.MULTILEVEL:
        return "หลายระดับ (Multilevel Queue)";
      case QueueAlgorithmType.MULTILEVEL_FEEDBACK:
        return "ปรับความสำคัญตามเวลารอคอย (Multilevel Feedback)";
      default:
        return "อัลกอริทึมเรียกคิว";
    }
  };

  return (
    <div className="min-h-screen bg-pharmacy-50 flex flex-col">
      <QueuePageHeader
        currentTime={currentTime}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        title="ระบบแสดงคิว"
      />

      {/* Split screen layout */}
      <div className="flex flex-col md:flex-row flex-1 w-full">
        {/* Right side: INS Queue */}
        <div className="w-full md:w-1/2 p-2">
          <div className="bg-white rounded-lg shadow-md p-4 h-full">
            <h2 className="text-xl font-semibold text-center mb-4 text-pharmacy-700">
              ระบบแสดงคิวตรวจ
            </h2>
            <div className="h-[calc(100%-2rem)] overflow-auto">
              <QueueInsBoardContainer />
            </div>
          </div>
        </div>

        {/* Left side: Pharmacy Queue */}
        <div className="w-full md:w-1/2 border-r border-gray-200 p-2">
          {/* Algorithm info only for pharmacy queue */}
          <div className="bg-white rounded-lg shadow-md p-4 h-full">
            {/* <QueueBoardAlgorithmInfo
              algorithmName={getCurrentAlgorithmName()}
            /> */}
            <h2 className="text-xl font-semibold text-center mb-4 text-pharmacy-700">
              ระบบแสดงคิวห้องยา
            </h2>
            <div className="h-[calc(100%-2rem)] overflow-auto">
              <QueueBoardContainer />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto">
        <HospitalFooter />
      </div>
    </div>
  );
};

export default CombinedQueueBoard;
