import * as React from "react";
import { DirectionProvider } from "@radix-ui/react-direction";
import { Queue, QueueIns } from "@/integrations/supabase/schema";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAnalyticsData } from "./analytics/useAnalyticsData";
import { useCombinedWaitTimeData } from "./analytics/hooks/useCombinedWaitTimeData";
import { useCombinedThroughputData } from "./analytics/hooks/useCombinedThroughputData";
import { useTimeFrameState } from "./analytics/hooks/useTimeFrameState";
import SummaryCards from "./analytics/SummaryCards";
import AlgorithmRecommendation from "./analytics/AlgorithmRecommendation";
import TabSelector from "./analytics/TabSelector";
import WaitTimeChart from "./analytics/WaitTimeChart";
import ThroughputChart from "./analytics/ThroughputChart";
import QueueCompositionChart from "./analytics/QueueCompositionChart";
import { SettingsProvider } from "@/contexts/SettingsContext";

interface QueueAnalyticsProps {
  completedQueues: Queue[];
  waitingQueues: Queue[];
  activeQueues: Queue[];
  skippedQueues: Queue[];
  // INS Queue props
  completedInsQueues?: QueueIns[];
  waitingInsQueues?: QueueIns[];
  activeInsQueues?: QueueIns[];
  skippedInsQueues?: QueueIns[];
  className?: string;
}

const QueueAnalytics: React.FC<QueueAnalyticsProps> = ({
  completedQueues,
  waitingQueues,
  activeQueues,
  skippedQueues,
  // INS Queue data
  completedInsQueues = [],
  waitingInsQueues = [],
  activeInsQueues = [],
  skippedInsQueues = [],
  className,
}) => {
  // Use separate hooks for better control
  const { timeFrame, setTimeFrame } = useTimeFrameState();
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);
  
  // Use combined data hooks that include both Pharmacy and INS queues
  const combinedWaitTimeData = useCombinedWaitTimeData(timeFrame, refreshTrigger);
  const combinedThroughputData = useCombinedThroughputData(timeFrame, refreshTrigger);
  
  // Get other analytics data from original hook
  const {
    averageWaitTime,
    averageServiceTime,
    currentAlgorithm,
    recommendedAlgorithm,
    shouldChangeAlgorithm,
    urgentCount,
    elderlyCount,
    handleChangeAlgorithm,
  } = useAnalyticsData(completedQueues, waitingQueues);
  
  // Force refresh charts when queues change
  React.useEffect(() => {
    const totalQueues = completedQueues.length + waitingQueues.length + 
                       completedInsQueues.length + waitingInsQueues.length;
    if (totalQueues > 0) {
      setRefreshTrigger(prev => prev + 1);
    }
  }, [completedQueues.length, waitingQueues.length, completedInsQueues.length, waitingInsQueues.length]);

  const calculateInsStats = React.useMemo(() => {
    const completedWithTimes = completedInsQueues.filter(
      (q) => q.called_at && q.completed_at
    );

    let totalWaitTime = 0;
    let totalServiceTime = 0;

    completedWithTimes.forEach((queue) => {
      if (queue.created_at && queue.called_at) {
        const waitTime =
          new Date(queue.called_at).getTime() -
          new Date(queue.created_at).getTime();
        totalWaitTime += waitTime / 1000 / 60;
      }

      if (queue.called_at && queue.completed_at) {
        const serviceTime =
          new Date(queue.completed_at).getTime() -
          new Date(queue.called_at).getTime();
        totalServiceTime += serviceTime / 1000 / 60; 
      }
    });

    return {
      averageInsWaitTime:
        completedWithTimes.length > 0
          ? totalWaitTime / completedWithTimes.length
          : 0,
      averageInsServiceTime:
        completedWithTimes.length > 0
          ? totalServiceTime / completedWithTimes.length
          : 0,
    };
  }, [completedInsQueues]);

  console.log("averageWaitTime", averageWaitTime);

  return (
    <DirectionProvider dir="ltr">
      <div className={cn("space-y-6", className)}>
        <SummaryCards
          waitingQueueCount={waitingQueues.length}
          averageWaitTime={averageWaitTime}
          averageServiceTime={averageServiceTime}
          completedQueueCount={completedQueues.length}
          waitingInsQueueCount={waitingInsQueues.length}
          averageInsWaitTime={calculateInsStats.averageInsWaitTime}
          averageInsServiceTime={calculateInsStats.averageInsServiceTime}
          completedInsQueueCount={completedInsQueues.length}
        />

        {shouldChangeAlgorithm && (
          <SettingsProvider>
            <AlgorithmRecommendation
              shouldChangeAlgorithm={shouldChangeAlgorithm}
              currentAlgorithm={currentAlgorithm}
              recommendedAlgorithm={recommendedAlgorithm}
              urgentCount={urgentCount}
              elderlyCount={elderlyCount}
              waitingQueueCount={waitingQueues.length}
              handleChangeAlgorithm={handleChangeAlgorithm}
            />
          </SettingsProvider>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card className="w-full">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-lg">เวลารอเฉลี่ย</CardTitle>
                <TabSelector
                  timeFrame={timeFrame}
                  setTimeFrame={setTimeFrame}
                />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <WaitTimeChart data={combinedWaitTimeData} timeFrame={timeFrame} />
            </CardContent>
          </Card>

          <Card className="w-full">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-lg">ปริมาณผู้มารับบริการ</CardTitle>
                <TabSelector
                  timeFrame={timeFrame}
                  setTimeFrame={setTimeFrame}
                />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <ThroughputChart data={combinedThroughputData} timeFrame={timeFrame} />
            </CardContent>
          </Card>
        </div>

        <Card className="w-full">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">ลักษณะของคิว</CardTitle>
            <p className="text-sm text-muted-foreground">
              การกระจายตัวของประเภทคิวที่รออยู่ในปัจจุบัน
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            <Tabs defaultValue="composition" className="w-full">
              <TabsContent value="composition" className="mt-0">
                <QueueCompositionChart 
                  waitingQueues={waitingQueues}
                  waitingInsQueues={waitingInsQueues}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DirectionProvider>
  );
};

export default QueueAnalytics;
