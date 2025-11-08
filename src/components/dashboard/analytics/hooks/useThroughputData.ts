
import * as React from 'react';
import { format, startOfDay, startOfWeek, startOfMonth } from 'date-fns';
import { th } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { TimeFrame } from './useTimeFrameState';

export const useThroughputData = (timeFrame: TimeFrame, refreshTrigger?: number) => {
  // Always define state hooks first
  const [throughputData, setThroughputData] = React.useState<any[]>([]);
  
  // Define any callbacks with useCallback before useEffect
  const fetchData = React.useCallback(async () => {
    try {
      let startDate: Date;
      let endDate = new Date();
      
      // Set time range based on timeFrame
      if (timeFrame === 'day') {
        startDate = startOfDay(new Date());
      } else if (timeFrame === 'week') {
        startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
      } else { // month
        startDate = startOfMonth(new Date());
      }
      
      // Fetch throughput data (completed queues count) directly from Supabase
      const { data: throughputQueryData, error: throughputError } = await supabase
        .from('queues')
        .select('completed_at, status')
        .eq('status', 'COMPLETED')
        .gte('completed_at', startDate.toISOString())
        .lte('completed_at', endDate.toISOString())
        .order('completed_at', { ascending: true });
        
      if (throughputError) {
        console.error('Error fetching throughput data:', throughputError);
        return;
      }
      
      // Process throughput data
      const throughputMap = new Map();
      
      throughputQueryData?.forEach(queue => {
        if (queue.completed_at) {
          let timeKey: string;
          const completedDate = new Date(queue.completed_at);
          
          if (timeFrame === 'day') {
            timeKey = format(completedDate, 'HH:00', { locale: th });
          } else {
            timeKey = format(completedDate, 'dd MMM', { locale: th });
          }
          
          if (!throughputMap.has(timeKey)) {
            throughputMap.set(timeKey, 0);
          }
          
          throughputMap.set(timeKey, throughputMap.get(timeKey) + 1);
        }
      });
      
      // Generate data for all time points in the range
      const throughputChartData = [];
      
      if (timeFrame === 'day') {
        for (let hour = 0; hour < 24; hour++) {
          const timeKey = `${hour.toString().padStart(2, '0')}:00`;
          
          throughputChartData.push({
            time: timeKey,
            count: throughputMap.get(timeKey) || 0
          });
        }
      } else {
        let currentDate = new Date(startDate);
        
        while (currentDate <= endDate) {
          const timeKey = format(currentDate, 'dd MMM', { locale: th });
          
          throughputChartData.push({
            time: timeKey,
            count: throughputMap.get(timeKey) || 0
          });
          
          currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
        }
      }
      
      setThroughputData(throughputChartData);
    } catch (error) {
      console.error('Error in fetchThroughputData:', error);
    }
  }, [timeFrame, refreshTrigger]);
  
  // useEffect should always be at the end of the hook
  React.useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  return throughputData;
};
