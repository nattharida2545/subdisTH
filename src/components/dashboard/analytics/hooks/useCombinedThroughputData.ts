import * as React from 'react';
import { format, startOfDay, startOfWeek, startOfMonth } from 'date-fns';
import { th } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { TimeFrame } from './useTimeFrameState';

export const useCombinedThroughputData = (timeFrame: TimeFrame, refreshTrigger?: number) => {
  const [throughputData, setThroughputData] = React.useState<any[]>([]);
  
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
        .select('completed_at')
        .eq('status', 'COMPLETED')
        .gte('completed_at', startDate.toISOString())
        .lte('completed_at', endDate.toISOString())
        .order('completed_at', { ascending: true });
        
      if (pharmacyError) {
        console.error('Error fetching pharmacy throughput data:', pharmacyError);
      }
      
      // Fetch INS Queue data
      const { data: insData, error: insError } = await supabase
        .from('queues_ins')
        .select('completed_at')
        .eq('status', 'COMPLETED')
        .gte('completed_at', startDate.toISOString())
        .lte('completed_at', endDate.toISOString())
        .order('completed_at', { ascending: true });
        
      if (insError) {
        console.error('Error fetching INS throughput data:', insError);
      }
      
      // Process Pharmacy Queue data
      const pharmacyCountMap = new Map();
      pharmacyData?.forEach(queue => {
        if (queue.completed_at) {
          let timeKey: string;
          const completedDate = new Date(queue.completed_at);
          
          if (timeFrame === 'day') {
            timeKey = format(completedDate, 'HH:00', { locale: th });
          } else {
            timeKey = format(completedDate, 'dd MMM', { locale: th });
          }
          
          pharmacyCountMap.set(timeKey, (pharmacyCountMap.get(timeKey) || 0) + 1);
        }
      });
      
      // Process INS Queue data
      const insCountMap = new Map();
      insData?.forEach(queue => {
        if (queue.completed_at) {
          let timeKey: string;
          const completedDate = new Date(queue.completed_at);
          
          if (timeFrame === 'day') {
            timeKey = format(completedDate, 'HH:00', { locale: th });
          } else {
            timeKey = format(completedDate, 'dd MMM', { locale: th });
          }
          
          insCountMap.set(timeKey, (insCountMap.get(timeKey) || 0) + 1);
        }
      });
      
      // Generate combined data
      const throughputChartData = [];
      
      if (timeFrame === 'day') {
        for (let hour = 0; hour < 24; hour++) {
          const timeKey = `${hour.toString().padStart(2, '0')}:00`;
          
          throughputChartData.push({
            time: timeKey,
            count: pharmacyCountMap.get(timeKey) || 0,
            insCount: insCountMap.get(timeKey) || 0
          });
        }
      } else {
        let currentDate = new Date(startDate);
        
        while (currentDate <= endDate) {
          const timeKey = format(currentDate, 'dd MMM', { locale: th });
          
          throughputChartData.push({
            time: timeKey,
            count: pharmacyCountMap.get(timeKey) || 0,
            insCount: insCountMap.get(timeKey) || 0
          });
          
          currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
        }
      }
      
      setThroughputData(throughputChartData);
    } catch (error) {
      console.error('Error in fetchCombinedThroughputData:', error);
    }
  }, [timeFrame, refreshTrigger]);
  
  React.useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  return throughputData;
};
