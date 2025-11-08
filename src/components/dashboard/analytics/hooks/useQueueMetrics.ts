import * as React from "react";
import { Queue } from "@/integrations/supabase/schema";

export const useQueueMetrics = (completedQueues: Queue[]) => {
  // Always define state hooks first
  const [metrics, setMetrics] = React.useState({
    averageWaitTime: 0,
    averageServiceTime: 0,
    urgentCount: 0,
    elderlyCount: 0,
  });

  // Define callbacks with useCallback before useEffect if needed
  const calculateMetrics = React.useCallback((queues: Queue[]) => {
    if (!queues || queues.length === 0) {
      return {
        averageWaitTime: 0,
        averageServiceTime: 0,
        urgentCount: 0,
        elderlyCount: 0,
      };
    }

    // Calculate average wait time (from created to called)
    let totalWaitTime = 0;
    let waitTimeCount = 0;

    // Calculate average service time (from called to completed)
    let totalServiceTime = 0;
    let serviceTimeCount = 0;

    // Count urgent and elderly queues
    let urgentCount = 0;
    let elderlyCount = 0;

    queues.forEach((queue) => {
      // Count by types - use schema enum types
      if (queue.type === "URGENT") urgentCount++;
      if (queue.type === "ELDERLY") elderlyCount++;

      // Calculate wait time
      if (queue.created_at && queue.called_at) {
        const waitMs =
          new Date(queue.called_at).getTime() -
          new Date(queue.created_at).getTime();
        const waitMinutes = waitMs / 60000;
        totalWaitTime += waitMinutes;
        waitTimeCount++;
      }

      // Calculate service time
      if (queue.called_at && queue.completed_at) {
        const serviceMs =
          new Date(queue.completed_at).getTime() -
          new Date(queue.called_at).getTime();
        const serviceMinutes = serviceMs / 60000;
        totalServiceTime += serviceMinutes;
        serviceTimeCount++;
      }
    });
    console.log("waitTimeCount", waitTimeCount);
    console.log("totalWaitTime", totalWaitTime);
    return {
      averageWaitTime:
        waitTimeCount > 0 ? Math.round(totalWaitTime / waitTimeCount) : 0,
      averageServiceTime:
        serviceTimeCount > 0
          ? Math.round(totalServiceTime / serviceTimeCount)
          : 0,
      urgentCount,
      elderlyCount,
    };
  }, []);

  // useEffect should always be at the end
  React.useEffect(() => {
    setMetrics(calculateMetrics(completedQueues));
  }, [completedQueues, calculateMetrics]);

  return metrics;
};
