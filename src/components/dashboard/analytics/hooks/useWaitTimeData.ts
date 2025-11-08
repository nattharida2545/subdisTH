
import * as React from 'react';
import { format, startOfDay, startOfWeek, startOfMonth } from 'date-fns';
import { th } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { TimeFrame } from './useTimeFrameState';

export const useWaitTimeData = (timeFrame: TimeFrame, refreshTrigger?: number) => {
  // Always define state hooks first
  const [waitTimeData, setWaitTimeData] = React.useState<any[]>([]);
  
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
      
      // Fetch wait time data from completed queues directly from Supabase
      const { data: waitTimeQueryData, error: waitTimeError } = await supabase
        .from('queues')
        .select('created_at, called_at')
        .not('called_at', 'is', null)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });
        
      if (waitTimeError) {
        console.error('Error fetching wait time data:', waitTimeError);
        return;
      }
      
      // Process wait time data
      const waitTimeMap = new Map();
      
      waitTimeQueryData?.forEach(queue => {
        if (queue.called_at && queue.created_at) {
          const waitMs = new Date(queue.called_at).getTime() - new Date(queue.created_at).getTime();
          const waitMinutes = waitMs / 60000;
          
          let timeKey: string;
          const createdDate = new Date(queue.created_at);
          
          if (timeFrame === 'day') {
            timeKey = format(createdDate, 'HH:00', { locale: th });
          } else {
            timeKey = format(createdDate, 'dd MMM', { locale: th });
          }
          
          if (!waitTimeMap.has(timeKey)) {
            waitTimeMap.set(timeKey, { count: 0, total: 0 });
          }
          
          const current = waitTimeMap.get(timeKey);
          waitTimeMap.set(timeKey, {
            count: current.count + 1,
            total: current.total + waitMinutes
          });
        }
      });
      
      // Generate data for all time points in the range
      const waitTimeChartData = [];
      
      if (timeFrame === 'day') {
        for (let hour = 0; hour < 24; hour++) {
          const timeKey = `${hour.toString().padStart(2, '0')}:00`;
          const data = waitTimeMap.get(timeKey);
          
          waitTimeChartData.push({
            time: timeKey,
            waitTime: data ? Math.round(data.total / data.count) : 0
          });
        }
      } else {
        let currentDate = new Date(startDate);
        
        while (currentDate <= endDate) {
          const timeKey = format(currentDate, 'dd MMM', { locale: th });
          const data = waitTimeMap.get(timeKey);
          
          waitTimeChartData.push({
            time: timeKey,
            waitTime: data ? Math.round(data.total / data.count) : 0
          });
          
          currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
        }
      }
      
      setWaitTimeData(waitTimeChartData);
    } catch (error) {
      console.error('Error in fetchWaitTimeData:', error);
    }
  }, [timeFrame, refreshTrigger]);
  
  // useEffect should always be at the end of the hook
  React.useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  return waitTimeData;
};
