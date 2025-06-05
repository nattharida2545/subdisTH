
import * as React from 'react';
import { DirectionProvider } from '@radix-ui/react-direction';
import { Queue } from '@/integrations/supabase/schema';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAnalyticsData } from './analytics/useAnalyticsData';
import SummaryCards from './analytics/SummaryCards';
import AlgorithmRecommendation from './analytics/AlgorithmRecommendation';
import TabSelector from './analytics/TabSelector';
import WaitTimeChart from './analytics/WaitTimeChart';
import ThroughputChart from './analytics/ThroughputChart';
import QueueCompositionChart from './analytics/QueueCompositionChart';

interface QueueAnalyticsProps {
  completedQueues: Queue[];
  waitingQueues: Queue[];
  activeQueues: Queue[];
  skippedQueues: Queue[];
  className?: string;
}

const QueueAnalytics: React.FC<QueueAnalyticsProps> = ({
  completedQueues,
  waitingQueues,
  activeQueues,
  skippedQueues,
  className
}) => {
  const {
    timeFrame,
    setTimeFrame,
    waitTimeData,
    throughputData,
    averageWaitTime,
    averageServiceTime,
    currentAlgorithm,
    recommendedAlgorithm,
    shouldChangeAlgorithm,
    urgentCount,
    elderlyCount,
    handleChangeAlgorithm
  } = useAnalyticsData(completedQueues, waitingQueues);

  return (
    <DirectionProvider dir="ltr">
      <div className={cn("space-y-6", className)}>
        <SummaryCards
          waitingQueueCount={waitingQueues.length}
          averageWaitTime={averageWaitTime}
          averageServiceTime={averageServiceTime}
          completedQueueCount={completedQueues.length}
        />
        
        {shouldChangeAlgorithm && (
          <AlgorithmRecommendation
            shouldChangeAlgorithm={shouldChangeAlgorithm}
            currentAlgorithm={currentAlgorithm}
            recommendedAlgorithm={recommendedAlgorithm}
            urgentCount={urgentCount}
            elderlyCount={elderlyCount}
            waitingQueueCount={waitingQueues.length}
            handleChangeAlgorithm={handleChangeAlgorithm}
          />
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>เวลารอเฉลี่ย</CardTitle>
              <TabSelector timeFrame={timeFrame} setTimeFrame={setTimeFrame} />
            </CardHeader>
            <CardContent>
              <WaitTimeChart data={waitTimeData} timeFrame={timeFrame} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>ปริมาณผู้มารับบริการ</CardTitle>
              <TabSelector timeFrame={timeFrame} setTimeFrame={setTimeFrame} />
            </CardHeader>
            <CardContent>
              <ThroughputChart data={throughputData} timeFrame={timeFrame} />
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="composition" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ลักษณะของคิว</CardTitle>
            </CardHeader>
            <CardContent>
              <TabsContent value="composition" className="mt-0">
                <QueueCompositionChart waitingQueues={waitingQueues} />
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </DirectionProvider>
  );
};

export default QueueAnalytics;
