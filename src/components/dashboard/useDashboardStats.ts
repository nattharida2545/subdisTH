import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { Queue } from "@/integrations/supabase/schema";
import { getTodayDate } from "@/utils/dateUtils";

export const useDashboardStats = (completedQueues: Queue[]) => {
  const [todayStats, setTodayStats] = React.useState({
    avgWaitTime: 0,
    avgServiceTime: 0,
  });

  // Fetch today's statistics
  React.useEffect(() => {
    const fetchTodayStats = async () => {
      try {
        // Get today's date at midnight
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Fetch completed queues for today
        const { data, error } = await supabase
          .from("queues")
          .select("*")
          .eq("status", "COMPLETED")
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          // Calculate average wait time and service time
          const totalWaitTime = data.reduce((sum, queue) => {
            if (queue.called_at && queue.created_at) {
              const waitMs =
                new Date(queue.called_at).getTime() -
                new Date(queue.created_at).getTime();
              return sum + waitMs / 60000; // Convert to minutes
            }
            return sum;
          }, 0);

          const totalServiceTime = data.reduce((sum, queue) => {
            if (queue.completed_at && queue.called_at) {
              const serviceMs =
                new Date(queue.completed_at).getTime() -
                new Date(queue.called_at).getTime();
              return sum + serviceMs / 60000; // Convert to minutes
            }
            return sum;
          }, 0);

          //today Cal
          const totalWaitTimeToday = data.reduce((sum, queue) => {
            console.log("queue_date", queue.queue_date);
            console.log("dateNow:", new Date().toISOString());
            if (
              queue.called_at &&
              queue.created_at &&
              queue.queue_date === getTodayDate()
            ) {
              const waitMs =
                new Date(queue.called_at).getTime() -
                new Date(queue.created_at).getTime();
              return sum + waitMs / 60000;
            }
            return sum;
          }, 0);

          const totalServiceTimeToday = data.reduce((sum, queue) => {
            if (
              queue.completed_at &&
              queue.called_at &&
              queue.queue_date === getTodayDate()
            ) {
              const serviceMs =
                new Date(queue.completed_at).getTime() -
                new Date(queue.called_at).getTime();
              return sum + serviceMs / 60000;
            }
            return sum;
          }, 0);

          setTodayStats({
            avgWaitTime: data.length > 0 ? totalWaitTimeToday / data.length : 0,
            avgServiceTime:
              data.length > 0 ? totalServiceTimeToday / data.length : 0,
          });
        }
      } catch (err) {
        console.error("Error fetching today stats:", err);
      }
    };

    fetchTodayStats();
  }, []);

  return todayStats;
};
