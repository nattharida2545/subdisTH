import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lightbulb } from "lucide-react";
import { QueueAlgorithmType } from "@/utils/queueAlgorithms";
import AlgorithmComparisonDialog from "@/components/analytics/AlgorithmComparisonDialog";
import { useSettingsContext } from "@/contexts/SettingsContext";
import { toast } from "sonner";

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
  handleChangeAlgorithm,
}) => {
  if (!shouldChangeAlgorithm) return null;
  const { updateMultipleSettings } = useSettingsContext();
  const fhandleChangeAlgorithm = async () => {
    const success = await updateMultipleSettings({
      queue_algorithm: recommendedAlgorithm,
    });
    if (success) {
      // Save to localStorage for immediate use
      handleChangeAlgorithm();
      toast.success("บันทึกอัลกอริทึมคิวเรียบร้อยแล้ว");
    } else {
      toast.error("ไม่สามารถบันทึกอัลกอริทึมคิวได้");
    }
  };

  const getRecommendationReason = () => {
    const urgentPercentage =
      waitingQueueCount > 0
        ? Math.round((urgentCount / waitingQueueCount) * 100)
        : 0;
    const elderlyPercentage =
      waitingQueueCount > 0
        ? Math.round((elderlyCount / waitingQueueCount) * 100)
        : 0;

    if (recommendedAlgorithm === QueueAlgorithmType.PRIORITY) {
      return `พบคิวเร่งด่วน ${urgentCount} คิว (${urgentPercentage}% ของคิวทั้งหมด)`;
    } else if (recommendedAlgorithm === QueueAlgorithmType.MULTILEVEL) {
      return `พบคิวผู้สูงอายุ ${elderlyCount} คิว (${elderlyPercentage}% ของคิวทั้งหมด)`;
    } else {
      return `คิวจำนวนมาก (${waitingQueueCount} คิว) เหมาะสำหรับอัลกอริธึมแบบปรับตัว`;
    }
  };

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-amber-800">
          <Lightbulb className="h-5 w-5" />
          คำแนะนำการปรับปรุงอัลกอริธึม
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-amber-200 bg-amber-100">
          <AlertDescription className="text-amber-800">
            <strong>เหตุผล:</strong> {getRecommendationReason()}
            <br />
            <strong>แนะนำ:</strong> เปลี่ยนจาก{" "}
            <Badge variant="outline">{currentAlgorithm}</Badge> เป็น{" "}
            <Badge className="bg-amber-600">{recommendedAlgorithm}</Badge>
          </AlertDescription>
        </Alert>

        <div className="flex justify-center">
          <AlgorithmComparisonDialog
            currentAlgorithm={currentAlgorithm}
            recommendedAlgorithm={recommendedAlgorithm}
            urgentCount={urgentCount}
            elderlyCount={elderlyCount}
            waitingQueueCount={waitingQueueCount}
            onConfirmChange={fhandleChangeAlgorithm}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AlgorithmRecommendation;
