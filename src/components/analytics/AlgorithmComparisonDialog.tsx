
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { QueueAlgorithmType } from '@/utils/queueAlgorithms';

interface AlgorithmComparisonDialogProps {
  currentAlgorithm: QueueAlgorithmType;
  recommendedAlgorithm: QueueAlgorithmType;
  urgentCount: number;
  elderlyCount: number;
  waitingQueueCount: number;
  onConfirmChange: () => void;
}

const AlgorithmComparisonDialog: React.FC<AlgorithmComparisonDialogProps> = ({
  currentAlgorithm,
  recommendedAlgorithm,
  urgentCount,
  elderlyCount,
  waitingQueueCount,
  onConfirmChange
}) => {
  const [open, setOpen] = useState(false);

  const getAlgorithmDescription = (algorithm: QueueAlgorithmType) => {
    switch (algorithm) {
      case QueueAlgorithmType.FIFO:
        return 'ตามลำดับการมา (First In, First Out)';
      case QueueAlgorithmType.PRIORITY:
        return 'จัดลำดับตามความเร่งด่วน';
      case QueueAlgorithmType.MULTILEVEL:
        return 'หลายระดับตามประเภทคิว';
      case QueueAlgorithmType.MULTILEVEL_FEEDBACK:
        return 'หลายระดับแบบปรับตัว';
      case QueueAlgorithmType.ROUND_ROBIN:
        return 'หมุนเวียนตามประเภท';
      default:
        return 'อัลกอริธึมพื้นฐาน';
    }
  };

  const getExpectedImprovements = () => {
    if (recommendedAlgorithm === QueueAlgorithmType.PRIORITY) {
      return {
        waitTime: { value: -25, text: 'ลดลง 25%' },
        urgentHandling: { value: 80, text: 'เพิ่มขึ้น 80%' },
        satisfaction: { value: 30, text: 'เพิ่มขึ้น 30%' }
      };
    } else if (recommendedAlgorithm === QueueAlgorithmType.MULTILEVEL) {
      return {
        waitTime: { value: -15, text: 'ลดลง 15%' },
        elderlyHandling: { value: 60, text: 'เพิ่มขึ้น 60%' },
        efficiency: { value: 20, text: 'เพิ่มขึ้น 20%' }
      };
    } else {
      return {
        waitTime: { value: -10, text: 'ลดลง 10%' },
        efficiency: { value: 15, text: 'เพิ่มขึ้น 15%' },
        balance: { value: 25, text: 'เพิ่มขึ้น 25%' }
      };
    }
  };

  const improvements = getExpectedImprovements();

  const handleConfirm = () => {
    onConfirmChange();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
          เปรียบเทียบและเปลี่ยนอัลกอริธึม
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>เปรียบเทียบอัลกอริธึมการจัดคิว</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Current vs Recommended */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-600">อัลกอริธึมปัจจุบัน</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="outline">{currentAlgorithm}</Badge>
                  <p className="text-sm text-gray-600">{getAlgorithmDescription(currentAlgorithm)}</p>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-center">
              <ArrowRight className="h-8 w-8 text-blue-500" />
            </div>
            
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-blue-800">อัลกอริธึมที่แนะนำ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge className="bg-blue-600">{recommendedAlgorithm}</Badge>
                  <p className="text-sm text-blue-700">{getAlgorithmDescription(recommendedAlgorithm)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Current Situation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">สถานการณ์ปัจจุบัน</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{urgentCount}</div>
                  <div className="text-sm text-gray-600">คิวเร่งด่วน</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{elderlyCount}</div>
                  <div className="text-sm text-gray-600">คิวผู้สูงอายุ</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{waitingQueueCount}</div>
                  <div className="text-sm text-gray-600">คิวรอทั้งหมด</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Expected Improvements */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-lg text-green-800">ผลลัพธ์ที่คาดหวัง</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(improvements).map(([key, improvement]) => {
                  const isPositive = improvement.value > 0;
                  const isNegative = improvement.value < 0;
                  
                  return (
                    <div key={key} className="flex items-center space-x-2">
                      {isPositive && <TrendingUp className="h-5 w-5 text-green-600" />}
                      {isNegative && <TrendingDown className="h-5 w-5 text-green-600" />}
                      {improvement.value === 0 && <Minus className="h-5 w-5 text-gray-400" />}
                      <div>
                        <div className="font-medium text-green-800">{improvement.text}</div>
                        <div className="text-sm text-green-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          
          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleConfirm} className="bg-green-600 hover:bg-green-700">
              ยืนยันการเปลี่ยนแปลง
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AlgorithmComparisonDialog;
