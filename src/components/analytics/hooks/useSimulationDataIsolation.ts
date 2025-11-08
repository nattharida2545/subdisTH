import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/utils/logger";
import { simulationLogger } from "@/utils/simulationLogger";
import { simulationModeEmitter } from "@/hooks/useSimulationModeSync";
import { getTodayDate } from "@/utils/dateUtils";

const logger = createLogger("SimulationDataIsolation");

export interface SimulationMetrics {
  avgWaitTime: number;
  avgServiceTime: number;
  totalQueues: number;
  completedQueues: number;
  waitingQueues: number;
  activeQueues: number;
  isSimulationMode: boolean;
  avgWaitTimeToday: number;
  avgServiceTimeToday: number;
}

export const useSimulationDataIsolation = () => {
  const [simulationMetrics, setSimulationMetrics] = useState<SimulationMetrics>(
    {
      avgWaitTime: 0,
      avgServiceTime: 0,
      totalQueues: 0,
      completedQueues: 0,
      waitingQueues: 0,
      activeQueues: 0,
      avgWaitTimeToday: 0,
      avgServiceTimeToday: 0,
      isSimulationMode: false,
    }
  );

  // Fetch ONLY simulation data metrics
  const fetchSimulationMetrics = useCallback(async () => {
    try {
      logger.info("🔍 Fetching simulation-only metrics...");

      // Check if we have simulation queues
      const { data: allSimQueues, error: simError } = await supabase
        .from("queues")
        .select("*")
        .like("notes", "%ข้อมูลจำลองโรงพยาบาล%");

      if (simError) {
        logger.error("Error fetching simulation queues:", simError);
        return;
      }

      if (!allSimQueues || allSimQueues.length === 0) {
        // No simulation data - reset to normal mode
        const defaultMetrics = {
          avgWaitTime: 0,
          avgServiceTime: 0,
          totalQueues: 0,
          completedQueues: 0,
          waitingQueues: 0,
          activeQueues: 0,
          isSimulationMode: false,
        };
        setSimulationMetrics(defaultMetrics);

        // Immediately broadcast real-time mode
        simulationModeEmitter.emit(false);
        return;
      }

      // We have simulation data - calculate metrics
      const completedSim = allSimQueues.filter((q) => q.status === "COMPLETED");
      const waitingSim = allSimQueues.filter((q) => q.status === "WAITING");
      const activeSim = allSimQueues.filter((q) => q.status === "ACTIVE");

      // Calculate simulation-specific metrics
      let avgWaitTime = 0;
      let avgServiceTime = 0;

      if (completedSim.length > 0) {
        // Calculate average wait time (created to called)
        const totalWaitTime = completedSim.reduce((sum, queue) => {
          if (queue.called_at && queue.created_at) {
            const waitMs =
              new Date(queue.called_at).getTime() -
              new Date(queue.created_at).getTime();
            return sum + waitMs / 60000; // Convert to minutes
          }
          return sum;
        }, 0);

        // Calculate average service time (called to completed)
        const totalServiceTime = completedSim.reduce((sum, queue) => {
          if (queue.completed_at && queue.called_at) {
            const serviceMs =
              new Date(queue.completed_at).getTime() -
              new Date(queue.called_at).getTime();
            return sum + serviceMs / 60000; // Convert to minutes
          }
          return sum;
        }, 0);

        avgWaitTime = totalWaitTime / completedSim.length;
        avgServiceTime = totalServiceTime / completedSim.length;
      }

      const metrics = {
        avgWaitTime: Math.round(avgWaitTime * 100) / 100,
        avgServiceTime: Math.round(avgServiceTime * 100) / 100,
        totalQueues: allSimQueues.length,
        completedQueues: completedSim.length,
        waitingQueues: waitingSim.length,
        activeQueues: activeSim.length,
        isSimulationMode: true,
      };

      setSimulationMetrics(metrics);

      // Immediately broadcast simulation mode
      simulationModeEmitter.emit(true);

      logger.info("📊 Simulation metrics calculated:", metrics);

      // Log metrics capture
      simulationLogger.log(
        "METRICS_CAPTURED",
        "METRICS_FETCH",
        "CURRENT",
        "Simulation metrics fetched",
        metrics
      );
    } catch (error) {
      logger.error("Error fetching simulation metrics:", error);
    }
  }, []);

  // Fetch ONLY real (non-simulation) data metrics
  const fetchRealMetrics = useCallback(async () => {
    try {
      logger.info("🏥 Fetching real hospital data metrics...");

      // Get today's date at midnight
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Fetch real (non-simulation) completed queues for today
      const { data: realQueues, error } = await supabase
        .from("queues")
        .select("*")
        .eq("status", "COMPLETED")
        .order("created_at", { ascending: false });

      if (error) {
        logger.error("Error fetching real metrics:", error);
        return;
      }

      if (!realQueues || realQueues.length === 0) {
        const defaultMetrics = {
          avgWaitTime: 0,
          avgServiceTime: 0,
          totalQueues: 0,
          completedQueues: 0,
          waitingQueues: 0,
          activeQueues: 0,
          isSimulationMode: false,
          avgWaitTimeToday: 0,
          avgServiceTimeToday: 0,
        };
        setSimulationMetrics(defaultMetrics);

        // Immediately broadcast real-time mode
        simulationModeEmitter.emit(false);
        return;
      }
      const queueTodayCount = realQueues.reduce((sum, queue) => {
        if (
          queue.called_at &&
          queue.created_at &&
          queue.completed_at &&
          queue.queue_date === getTodayDate()
        ) {
          return sum + 1;
        }
        return sum;
      }, 0);

      console.log("queueTodayCount", queueTodayCount);

      // Calculate real data metrics
      const totalWaitTime = realQueues.reduce((sum, queue) => {
        if (queue.called_at && queue.created_at) {
          const waitMs =
            new Date(queue.called_at).getTime() -
            new Date(queue.created_at).getTime();
          return sum + waitMs / 60000;
        }
        return sum;
      }, 0);

      const totalServiceTime = realQueues.reduce((sum, queue) => {
        if (queue.completed_at && queue.called_at) {
          const serviceMs =
            new Date(queue.completed_at).getTime() -
            new Date(queue.called_at).getTime();
          return sum + serviceMs / 60000;
        }
        return sum;
      }, 0);

      //today Cal
      const totalWaitTimeToday = realQueues.reduce((sum, queue) => {
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

      console.log("totalWaitTimeToday", totalWaitTimeToday);

      const totalServiceTimeToday = realQueues.reduce((sum, queue) => {
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

      const metrics = {
        avgWaitTime: Math.round(totalWaitTime / realQueues.length),
        avgServiceTime: Math.round(totalServiceTime / realQueues.length),
        totalQueues: realQueues.length,
        completedQueues: realQueues.length,
        waitingQueues: 0,
        activeQueues: 0,
        avgWaitTimeToday: Math.round(totalWaitTimeToday / queueTodayCount),
        avgServiceTimeToday: Math.round(
          totalServiceTimeToday / queueTodayCount
        ),
        isSimulationMode: false,
      };

      setSimulationMetrics(metrics);

      // Immediately broadcast real-time mode
      simulationModeEmitter.emit(false);

      logger.info("📊 Real hospital metrics calculated:", metrics);
    } catch (error) {
      logger.error("Error fetching real metrics:", error);
    }
  }, []);

  // Determine data mode and fetch appropriate metrics
  const refreshMetrics = useCallback(async () => {
    try {
      // First check if we have any simulation data
      const { data: simCheck } = await supabase
        .from("queues")
        .select("id")
        .like("notes", "%ข้อมูลจำลองโรงพยาบาล%")
        .limit(1);

      if (simCheck && simCheck.length > 0) {
        // We have simulation data - fetch simulation metrics
        await fetchSimulationMetrics();
      } else {
        // No simulation data - fetch real metrics
        await fetchRealMetrics();
      }
    } catch (error) {
      logger.error("Error refreshing metrics:", error);
    }
  }, [fetchSimulationMetrics, fetchRealMetrics]);

  // Verify complete cleanup
  const verifyCleanup = useCallback(async (): Promise<boolean> => {
    try {
      logger.info("🔍 Verifying cleanup completion...");

      const { data: remainingSimQueues, error } = await supabase
        .from("queues")
        .select("id, notes, status, created_at")
        .like("notes", "%ข้อมูลจำลองโรงพยาบาล%");

      if (error) {
        logger.error("Error verifying cleanup:", error);
        return false;
      }

      const isCleanupComplete =
        !remainingSimQueues || remainingSimQueues.length === 0;

      logger.info(
        `✅ Cleanup verification: ${
          isCleanupComplete ? "COMPLETE" : "INCOMPLETE"
        }`,
        {
          remainingSimQueues: remainingSimQueues?.length || 0,
        }
      );

      return isCleanupComplete;
    } catch (error) {
      logger.error("Error during cleanup verification:", error);
      return false;
    }
  }, []);

  // Auto-refresh metrics when queues change
  useEffect(() => {
    refreshMetrics();

    // Set up real-time subscription for queue changes
    const channel = supabase
      .channel("simulation-data-isolation")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "queues" },
        (payload) => {
          logger.info("Queue change detected, refreshing metrics...", payload);
          // Remove delay for immediate updates
          refreshMetrics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshMetrics]);

  return {
    simulationMetrics,
    refreshMetrics,
    verifyCleanup,
    fetchSimulationMetrics,
    fetchRealMetrics,
  };
};
