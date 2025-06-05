
import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { QueueAlgorithmType } from '@/utils/queueAlgorithms';

interface AlgorithmRecommendationProps {
  shouldChangeAlgorithm: boolean;
  currentAlgorithm: QueueAlgorithmType;
  recommendedAlgorithm: QueueAlgorithmType;
  urgentCount: number;
  elderlyCount: number;
  waitingQueueCount: number;
  handleChangeAlgorithm: () => void;
}

const AlgorithmRecommendation: React.FC<AlgorithmRecommendationProps> = ({
  shouldChangeAlgorithm,
  currentAlgorithm,
  recommendedAlgorithm,
  urgentCount,
  elderlyCount,
  waitingQueueCount,
  handleChangeAlgorithm
}) => {
  if (!shouldChangeAlgorithm) return null;
  
  const getAlgorithmName = (algorithm: QueueAlgorithmType) => {
    switch (algorithm) {
      case QueueAlgorithmType.FIFO: return "First In, First Out (FIFO)";
      case QueueAlgorithmType.PRIORITY: return "ลำดับความสำคัญ (Priority Queue)";
      case QueueAlgorithmType.MULTILEVEL: return "หลายระดับ (Multilevel Queue)";
      case QueueAlgorithmType.MULTILEVEL_FEEDBACK: return "ปรับตามเวลารอ (Feedback Queue)";
      default: return "อัลกอริทึมพื้นฐาน";
    }
  };
  
  return (
    <Card className="shadow-sm bg-yellow-50 border-yellow-200 mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-yellow-800">
            <strong>คำแนะนำ:</strong> อัลกอริทึมปัจจุบัน {getAlgorithmName(currentAlgorithm)} 
            อาจไม่เหมาะสมกับสถานการณ์ปัจจุบัน
          </p>
          <p className="text-sm text-yellow-800">
            ระบบแนะนำให้ใช้ {getAlgorithmName(recommendedAlgorithm)} เนื่องจากมี
            {urgentCount > 0 ? ` ${urgentCount} คิวเร่งด่วน ` : ''}
            {elderlyCount > 0 ? ` ${elderlyCount} คิวผู้สูงอายุ ` : ''}
            จากทั้งหมด {waitingQueueCount} คิว
          </p>
          <button 
            className="bg-yellow-200 hover:bg-yellow-300 text-yellow-800 py-1 px-2 rounded text-sm"
            onClick={handleChangeAlgorithm}
          >
            เปลี่ยนเป็น {getAlgorithmName(recommendedAlgorithm)}
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AlgorithmRecommendation;
