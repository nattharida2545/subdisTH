import * as React from 'react';
import { format, startOfDay, startOfWeek, startOfMonth } from 'date-fns';
import { th } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { TimeFrame } from './useTimeFrameState';

export const useCombinedWaitTimeData = (timeFrame: TimeFrame, refreshTrigger?: number) => {
  const [waitTimeData, setWaitTimeData] = React.useState<any[]>([]);
  
  const fetchData = React.useCallback(async () => {
    try {
      let startDate: Date;
      let endDate = new Date();
      
      if (timeFrame === 'day') {
        startDate = startOfDay(new Date());
      } else if (timeFrame === 'week') {
        startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
      } else {
        startDate = startOfMonth(new Date());
      }
      
      // Fetch Pharmacy Queue data
      const { data: pharmacyData, error: pharmacyError } = await supabase
        .from('queues')
        .select('created_at, called_at')
        .not('called_at', 'is', null)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });
        
      if (pharmacyError) {
        console.error('Error fetching pharmacy wait time data:', pharmacyError);
      }
      
      // Fetch INS Queue data
      const { data: insData, error: insError } = await supabase
        .from('queues_ins')
        .select('created_at, called_at')
        .not('called_at', 'is', null)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });
        
      if (insError) {
        console.error('Error fetching INS wait time data:', insError);
      }
      
      // Process Pharmacy Queue data
      const pharmacyWaitTimeMap = new Map();
      pharmacyData?.forEach(queue => {
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
          
          if (!pharmacyWaitTimeMap.has(timeKey)) {
            pharmacyWaitTimeMap.set(timeKey, { count: 0, total: 0 });
          }
          
          const current = pharmacyWaitTimeMap.get(timeKey);
          pharmacyWaitTimeMap.set(timeKey, {
            count: current.count + 1,
            total: current.total + waitMinutes
          });
        }
      });
      
      // Process INS Queue data
      const insWaitTimeMap = new Map();
      insData?.forEach(queue => {
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
          
          if (!insWaitTimeMap.has(timeKey)) {
            insWaitTimeMap.set(timeKey, { count: 0, total: 0 });
          }
          
          const current = insWaitTimeMap.get(timeKey);
          insWaitTimeMap.set(timeKey, {
            count: current.count + 1,
            total: current.total + waitMinutes
          });
        }
      });
      
      // Generate combined data
      const waitTimeChartData = [];
      
      if (timeFrame === 'day') {
        for (let hour = 0; hour < 24; hour++) {
          const timeKey = `${hour.toString().padStart(2, '0')}:00`;
          const pharmacyData = pharmacyWaitTimeMap.get(timeKey);
          const insData = insWaitTimeMap.get(timeKey);
          
          waitTimeChartData.push({
            time: timeKey,
            waitTime: pharmacyData ? Math.round(pharmacyData.total / pharmacyData.count) : 0,
            insWaitTime: insData ? Math.round(insData.total / insData.count) : 0
          });
        }
      } else {
        let currentDate = new Date(startDate);
        
        while (currentDate <= endDate) {
          const timeKey = format(currentDate, 'dd MMM', { locale: th });
          const pharmacyData = pharmacyWaitTimeMap.get(timeKey);
          const insData = insWaitTimeMap.get(timeKey);
          
          waitTimeChartData.push({
            time: timeKey,
            waitTime: pharmacyData ? Math.round(pharmacyData.total / pharmacyData.count) : 0,
            insWaitTime: insData ? Math.round(insData.total / insData.count) : 0
          });
          
          currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
        }
      }
      
      setWaitTimeData(waitTimeChartData);
    } catch (error) {
      console.error('Error in fetchCombinedWaitTimeData:', error);
    }
  }, [timeFrame, refreshTrigger]);
  
  React.useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  return waitTimeData;
};
