import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { createLogger } from '@/utils/logger';

const logger = createLogger('DataComparison');

interface DataComparisonMetrics {
  avgWaitTime: number;
  completedQueues: number;
  throughput: number;
  totalQueues: number;
  label: string;
}

export const useDataComparison = () => {
  const [realData, setRealData] = useState<DataComparisonMetrics>({
    avgWaitTime: 0,
    completedQueues: 0,
    throughput: 0,
    totalQueues: 0,
    label: 'ข้อมูลจริง'
  });

  const [simulationData, setSimulationData] = useState<DataComparisonMetrics>({
    avgWaitTime: 0,
    completedQueues: 0,
    throughput: 0,
    totalQueues: 0,
    label: 'ข้อมูลจำลอง'
  });

  const [loading, setLoading] = useState(false);

  const fetchRealData = useCallback(async () => {
    try {
      logger.info('🔍 Fetching real queue data...');
      
      // Fetch real queue data (non-simulation) from last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: realQueues, error } = await supabase
        .from('queues')
        .select('*')
        .or('notes.is.null,notes.not.like.%ข้อมูลจำลองโรงพยาบาล%')
        .eq('status', 'COMPLETED')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(100); // Get recent 100 real queues

      if (error) {
        logger.error('❌ Error fetching real data:', error);
        return;
      }

      if (realQueues && realQueues.length > 0) {
        // Calculate real data metrics
        const avgWaitTime = realQueues.reduce((sum, queue) => {
          if (queue.called_at && queue.created_at) {
            const wait = (new Date(queue.called_at).getTime() - new Date(queue.created_at).getTime()) / 60000;
            return sum + Math.max(0, wait);
          }
          return sum;
        }, 0) / realQueues.length;

        const throughput = realQueues.length; // Simple throughput calculation

        setRealData({
          avgWaitTime: Math.round(avgWaitTime),
          completedQueues: realQueues.length,
          throughput: Math.round(throughput / 10), // Normalize to per-batch
          totalQueues: realQueues.length,
          label: 'ข้อมูลจริง'
        });

        logger.info(`✅ Real data loaded: ${realQueues.length} queues, avg wait: ${Math.round(avgWaitTime)} min`);
      }
    } catch (error) {
      logger.error('❌ Error in fetchRealData:', error);
    }
  }, []);

  const fetchSimulationData = useCallback(async () => {
    try {
      logger.info('🔍 Fetching simulation queue data...');
      
      // Fetch simulation queue data
      const { data: simQueues, error } = await supabase
        .from('queues')
        .select('*')
        .like('notes', '%ข้อมูลจำลองโรงพยาบาล%')
        .eq('status', 'COMPLETED')
        .order('created_at', { ascending: false })
        .limit(100); // Get recent 100 simulation queues

      if (error) {
        logger.error('❌ Error fetching simulation data:', error);
        return;
      }

      if (simQueues && simQueues.length > 0) {
        // Calculate simulation data metrics
        const avgWaitTime = simQueues.reduce((sum, queue) => {
          if (queue.called_at && queue.created_at) {
            const wait = (new Date(queue.called_at).getTime() - new Date(queue.created_at).getTime()) / 60000;
            return sum + Math.max(0, wait);
          }
          return sum;
        }, 0) / simQueues.length;

        const throughput = simQueues.length; // Simple throughput calculation

        setSimulationData({
          avgWaitTime: Math.round(avgWaitTime),
          completedQueues: simQueues.length,
          throughput: Math.round(throughput / 10), // Normalize to per-batch
          totalQueues: simQueues.length,
          label: 'ข้อมูลจำลอง'
        });

        logger.info(`✅ Simulation data loaded: ${simQueues.length} queues, avg wait: ${Math.round(avgWaitTime)} min`);
      }
    } catch (error) {
      logger.error('❌ Error in fetchSimulationData:', error);
    }
  }, []);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchRealData(),
        fetchSimulationData()
      ]);
    } finally {
      setLoading(false);
    }
  }, [fetchRealData, fetchSimulationData]);

  // Auto-refresh data when component mounts
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Check if simulation data exists
  const hasSimulationData = simulationData.totalQueues > 0;
  const hasRealData = realData.totalQueues > 0;

  return {
    realData,
    simulationData,
    loading,
    refreshData,
    hasSimulationData,
    hasRealData
  };
};