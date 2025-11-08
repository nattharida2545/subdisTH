import * as React from "react";
import { usePatients } from "@/hooks/usePatients";
import QueueSummaryCards from "@/components/dashboard/QueueSummaryCards";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardCards from "@/components/dashboard/DashboardCards";
import { useDashboardQueues } from "@/components/dashboard/useDashboardQueues";
import { useDashboardStats } from "@/components/dashboard/useDashboardStats";
import { createLogger } from "@/utils/logger";
import { useSimulationDataIsolation } from "@/components/analytics/hooks/useSimulationDataIsolation";
import { QueueIns } from "@/integrations/supabase/schema";
import { supabase } from "@/integrations/supabase/client";
import { getTodayDate } from "@/utils/dateUtils";
const logger = createLogger("Dashboard");

const Dashboard = () => {
  logger.debug("Dashboard component rendering");

  // Get patients and queue data
  const { patients = [] } = usePatients() || { patients: [] };
  const {
    waitingQueues = [],
    activeQueues = [],
    completedQueues = [],
  } = useDashboardQueues() || {};
  // const todayStats = useDashboardStats(completedQueues || []);
  const { simulationMetrics: todayStats } = useSimulationDataIsolation();
  console.log("todayStats", todayStats);

  // INS Queue states
  const [insQueues, setInsQueues] = React.useState<QueueIns[]>([]);
  const [waitingInsQueues, setWaitingInsQueues] = React.useState<QueueIns[]>([]);
  const [activeInsQueues, setActiveInsQueues] = React.useState<QueueIns[]>([]);
  const [completedInsQueues, setCompletedInsQueues] = React.useState<QueueIns[]>([]);

  // INS Queue stats
  const [insDisplayStats, setInsDisplayStats] = React.useState({
    avgWaitTime: 0,
    avgServiceTime: 0,
    avgWaitTimeToday: 0,
    avgServiceTimeToday: 0,
  });

  // Fetch INS queues and calculate stats
  React.useEffect(() => {
    const fetchInsQueues = async () => {
      try {
        // Fetch today's INS queues
        const { data: todayData, error: todayError } = await supabase
          .from("queues_ins")
          .select("*")
          .eq("queue_date", getTodayDate())
          .order("created_at", { ascending: true });

        if (todayError) throw todayError;

        if (todayData) {
          setInsQueues(todayData as QueueIns[]);
          
          const waiting = todayData.filter((q) => q.status === "WAITING");
          const active = todayData.filter((q) => q.status === "ACTIVE");
          const completed = todayData.filter((q) => q.status === "COMPLETED");

          setWaitingInsQueues(waiting as QueueIns[]);
          setActiveInsQueues(active as QueueIns[]);
          setCompletedInsQueues(completed as QueueIns[]);
        }

        // Fetch ALL completed INS queues for overall statistics
        const { data: allCompletedData, error: allError } = await supabase
          .from("queues_ins")
          .select("created_at, called_at, completed_at")
          .eq("status", "COMPLETED")
          .not("called_at", "is", null)
          .not("completed_at", "is", null)
          .order("completed_at", { ascending: false });

        if (allError) throw allError;

        // Calculate overall stats from all completed queues
        if (allCompletedData && allCompletedData.length > 0) {
          const waitTimes: number[] = [];
          const serviceTimes: number[] = [];

          allCompletedData.forEach((queue) => {
            const created = new Date(queue.created_at).getTime();
            const called = new Date(queue.called_at).getTime();
            const completed = new Date(queue.completed_at).getTime();

            const waitTime = (called - created) / (1000 * 60);
            const serviceTime = (completed - called) / (1000 * 60);

            if (waitTime >= 0) waitTimes.push(waitTime);
            if (serviceTime >= 0) serviceTimes.push(serviceTime);
          });

          const avgWaitTime =
            waitTimes.length > 0
              ? waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length
              : 0;
          const avgServiceTime =
            serviceTimes.length > 0
              ? serviceTimes.reduce((a, b) => a + b, 0) / serviceTimes.length
              : 0;

          // Calculate today's stats
          const todayCompleted = todayData?.filter((q) => q.status === "COMPLETED") || [];
          const todayWaitTimes: number[] = [];
          const todayServiceTimes: number[] = [];

          todayCompleted.forEach((queue) => {
            if (queue.called_at && queue.completed_at) {
              const created = new Date(queue.created_at).getTime();
              const called = new Date(queue.called_at).getTime();
              const completed = new Date(queue.completed_at).getTime();

              const waitTime = (called - created) / (1000 * 60);
              const serviceTime = (completed - called) / (1000 * 60);

              if (waitTime >= 0) todayWaitTimes.push(waitTime);
              if (serviceTime >= 0) todayServiceTimes.push(serviceTime);
            }
          });

          const avgWaitTimeToday =
            todayWaitTimes.length > 0
              ? todayWaitTimes.reduce((a, b) => a + b, 0) / todayWaitTimes.length
              : 0;
          const avgServiceTimeToday =
            todayServiceTimes.length > 0
              ? todayServiceTimes.reduce((a, b) => a + b, 0) / todayServiceTimes.length
              : 0;

          setInsDisplayStats({
            avgWaitTime,
            avgServiceTime,
            avgWaitTimeToday,
            avgServiceTimeToday,
          });
        }
      } catch (error) {
        logger.error("Error fetching INS queues:", error);
      }
    };

    fetchInsQueues();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("ins-queues-index")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "queues_ins",
          filter: `queue_date=eq.${getTodayDate()}`,
        },
        () => {
          fetchInsQueues();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="p-6">
      <DashboardHeader />

      <QueueSummaryCards
        waitingQueues={waitingQueues || []}
        activeQueues={activeQueues || []}
        completedQueues={completedQueues || []}
        avgWaitTimeToday={todayStats?.avgWaitTimeToday || 0}
        avgServiceTimeToday={todayStats?.avgServiceTimeToday || 0}
        queues={[
          ...(waitingQueues || []),
          ...(activeQueues || []),
          ...(completedQueues || []),
        ]}
        avgWaitTime={todayStats?.avgWaitTime || 0}
        avgServiceTime={todayStats?.avgServiceTime || 0}
        // INS Queue data
        insQueues={insQueues}
        waitingInsQueues={waitingInsQueues}
        activeInsQueues={activeInsQueues}
        completedInsQueues={completedInsQueues}
        insAvgWaitTime={insDisplayStats.avgWaitTime}
        insAvgServiceTime={insDisplayStats.avgServiceTime}
        insAvgWaitTimeToday={insDisplayStats.avgWaitTimeToday}
        insAvgServiceTimeToday={insDisplayStats.avgServiceTimeToday}
      />

      <DashboardCards
        waitingQueues={waitingQueues || []}
        activeQueues={activeQueues || []}
        completedQueues={completedQueues || []}
        patientsCount={patients?.length || 0}
        avgWaitTime={todayStats?.avgWaitTime || 0}
        waitingInsQueues={waitingInsQueues}
        activeInsQueues={activeInsQueues}
        completedInsQueues={completedInsQueues}
        avgInsWaitTime={insDisplayStats.avgWaitTime}
      />
    </div>
  );
};

export default Dashboard;
