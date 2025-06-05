
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QueueAlgorithmType } from '@/utils/queueAlgorithms';
import { 
  LayoutList,
  ListOrdered,
  Network,
  GitBranchPlus,
  HelpCircle
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface QueueAlgorithmInfoProps {
  currentAlgorithm: QueueAlgorithmType;
}

const QueueAlgorithmInfo: React.FC<QueueAlgorithmInfoProps> = ({ 
  currentAlgorithm 
}) => {
  const getAlgorithmIcon = (algorithm: QueueAlgorithmType) => {
    switch (algorithm) {
      case QueueAlgorithmType.FIFO:
        return <LayoutList className="h-5 w-5" />;
      case QueueAlgorithmType.PRIORITY:
        return <ListOrdered className="h-5 w-5" />;
      case QueueAlgorithmType.MULTILEVEL:
        return <Network className="h-5 w-5" />;
      case QueueAlgorithmType.MULTILEVEL_FEEDBACK:
        return <GitBranchPlus className="h-5 w-5" />;
      default:
        return <HelpCircle className="h-5 w-5" />;
    }
  };

  const getAlgorithmName = (algorithm: QueueAlgorithmType) => {
    switch (algorithm) {
      case QueueAlgorithmType.FIFO:
        return "FIFO (First In, First Out)";
      case QueueAlgorithmType.PRIORITY:
        return "ลำดับความสำคัญ (Priority Queue)";
      case QueueAlgorithmType.MULTILEVEL:
        return "หลายระดับ (Multilevel Queue)";
      case QueueAlgorithmType.MULTILEVEL_FEEDBACK:
        return "หลายระดับแบบปรับตัว (Multilevel Feedback)";
      default:
        return "ไม่ระบุ";
    }
  };

  const getAlgorithmDescription = (algorithm: QueueAlgorithmType) => {
    switch (algorithm) {
      case QueueAlgorithmType.FIFO:
        return "เรียกคิวตามลำดับการมาก่อน-หลัง โดยไม่คำนึงถึงประเภทคิวหรือความสำคัญ";
      case QueueAlgorithmType.PRIORITY:
        return "เรียกคิวโดยพิจารณาจากระดับความสำคัญของประเภทคิวก่อน แล้วจึงพิจารณาลำดับการมาก่อน-หลัง";
      case QueueAlgorithmType.MULTILEVEL:
        return "แบ่งประเภทคิวออกเป็นกลุ่มต่างๆ และจัดการแต่ละกลุ่มแยกกัน เพื่อให้แต่ละประเภทได้รับการบริการที่เหมาะสม";
      case QueueAlgorithmType.MULTILEVEL_FEEDBACK:
        return "แบ่งคิวออกเป็นระดับต่างๆ และปรับระดับความสำคัญตามเวลารอคอย ทำให้คิวที่รออยู่นานจะได้รับการบริการเร็วขึ้น";
      default:
        return "ไม่มีคำอธิบายสำหรับอัลกอริทึมนี้";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>อัลกอริทึมจัดการคิว</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help">
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="w-80 p-4">
                <div className="space-y-2">
                  <p className="font-semibold">อัลกอริทึมจัดการคิวคืออะไร?</p>
                  <p className="text-sm">
                    อัลกอริทึมจัดการคิวเป็นวิธีที่ระบบใช้ในการเรียกคิวตามลำดับที่เหมาะสม 
                    โดยพิจารณาปัจจัยต่างๆ เช่น ประเภทคิว ความสำคัญ และเวลารอคอย
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 mb-3">
          {getAlgorithmIcon(currentAlgorithm)}
          <div>
            <h3 className="font-semibold">{getAlgorithmName(currentAlgorithm)}</h3>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {getAlgorithmDescription(currentAlgorithm)}
        </p>
      </CardContent>
    </Card>
  );
};

export default QueueAlgorithmInfo;
