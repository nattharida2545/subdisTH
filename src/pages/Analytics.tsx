import * as React from "react";
import { DirectionProvider } from "@radix-ui/react-direction";
import { useQueues } from "@/hooks/useQueues";
import AnalyticsHeader from "@/components/analytics/AnalyticsHeader";
import AnalyticsContainer from "@/components/analytics/AnalyticsContainer";
import { Queue } from "@/integrations/supabase/schema";

const Analytics = () => {
  const { allQueuesNofilter, sortQueues, queues } = useQueues();

  // Create a wrapper function that matches the expected signature
  const sortQueuesWrapper = (queues: Queue[]): Queue[] => {
    return sortQueues ? sortQueues(queues) : queues;
  };

  return (
    <div className="p-3 md:p-6 min-h-screen bg-background">
      <DirectionProvider dir="ltr">
        <div className="max-w-7xl mx-auto space-y-6">
          <AnalyticsHeader />
          <AnalyticsContainer queues={queues} sortQueues={sortQueuesWrapper} />
        </div>
      </DirectionProvider>
    </div>
  );
};

export default Analytics;
