
import * as React from 'react';
import { Queue } from '@/integrations/supabase/schema';
import { supabase } from '@/integrations/supabase/client';
import QueueAnalytics from '@/components/dashboard/QueueAnalytics';
import QueueSummaryCards from '@/components/dashboard/QueueSummaryCards';
import { toast } from 'sonner';

interface AnalyticsContainerProps {
  queues: Queue[];
  sortQueues: (queues: Queue[]) => Queue[];
}

const AnalyticsContainer: React.FC<AnalyticsContainerProps> = ({ queues, sortQueues }) => {
  const [waitingQueues, setWaitingQueues] = React.useState<Queue[]>([]);
  const [activeQueues, setActiveQueues] = React.useState<Queue[]>([]);
  const [completedQueues, setCompletedQueues] = React.useState<Queue[]>([]);
  const [skippedQueues, setSkippedQueues] = React.useState<Queue[]>([]);
  const [todayStats, setTodayStats] = React.useState({
    avgWaitTime: 0,
    avgServiceTime: 0
  });

  // Update filtered queues when the main queues array changes
  React.useEffect(() => {
    if (queues) {
      const waiting = queues.filter(q => q.status === 'WAITING');
      const active = queues.filter(q => q.status === 'ACTIVE');
      const completed = queues.filter(q => q.status === 'COMPLETED');
      const skipped = queues.filter(q => q.status === 'SKIPPED');
      
      setWaitingQueues(sortQueues(waiting));
      setActiveQueues(active);
      setCompletedQueues(completed);
      setSkippedQueues(skipped);
    }
  }, [queues, sortQueues]);
  
  // Fetch today's statistics directly from Supabase
  React.useEffect(() => {
    const fetchTodayStats = async () => {
      try {
        // Get today's date at midnight
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Fetch completed queues for today
        const { data, error } = await supabase
          .from('queues')
          .select('*')
          .eq('status', 'COMPLETED')
          .gte('created_at', today.toISOString())
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Error fetching today stats:', error);
          toast.error('ไม่สามารถดึงข้อมูลสถิติได้');
          return;
        }
        
        if (data && data.length > 0) {
          // Calculate average wait time (from created to called)
          const totalWaitTime = data.reduce((sum, queue) => {
            if (queue.called_at && queue.created_at) {
              const waitMs = new Date(queue.called_at).getTime() - new Date(queue.created_at).getTime();
              return sum + (waitMs / 60000); // Convert to minutes
            }
            return sum;
          }, 0);
          
          // Calculate average service time (from called to completed)
          const totalServiceTime = data.reduce((sum, queue) => {
            if (queue.completed_at && queue.called_at) {
              const serviceMs = new Date(queue.completed_at).getTime() - new Date(queue.called_at).getTime();
              return sum + (serviceMs / 60000); // Convert to minutes
            }
            return sum;
          }, 0);
          
          setTodayStats({
            avgWaitTime: data.length > 0 ? totalWaitTime / data.length : 0,
            avgServiceTime: data.length > 0 ? totalServiceTime / data.length : 0
          });
          
          console.log('Fetched today stats:', {
            count: data.length,
            avgWaitTime: totalWaitTime / data.length,
            avgServiceTime: totalServiceTime / data.length
          });
        }
      } catch (err) {
        console.error('Error fetching today stats:', err);
      }
    };
    
    fetchTodayStats();
    
    // Set up real-time subscription for queues
    const channel = supabase
      .channel('analytics-queue-changes')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'queues' },
          (payload) => {
            console.log('Queue change detected in analytics:', payload);
            fetchTodayStats(); // Refresh stats when changes occur
          }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <>
      <QueueSummaryCards 
        waitingQueues={waitingQueues}
        activeQueues={activeQueues}
        completedQueues={completedQueues}
        queues={queues}
        avgWaitTime={todayStats.avgWaitTime}
        avgServiceTime={todayStats.avgServiceTime}
      />
      
      <QueueAnalytics 
        completedQueues={completedQueues}
        waitingQueues={waitingQueues}
        activeQueues={activeQueues}
        skippedQueues={skippedQueues}
        className="mb-6"
      />
    </>
  );
};

export default AnalyticsContainer;
