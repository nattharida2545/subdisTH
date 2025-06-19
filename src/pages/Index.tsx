
import * as React from 'react';
import { usePatients } from '@/hooks/usePatients';
import QueueSummaryCards from '@/components/dashboard/QueueSummaryCards';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardCards from '@/components/dashboard/DashboardCards';
import { useDashboardQueues } from '@/components/dashboard/useDashboardQueues';
import { useDashboardStats } from '@/components/dashboard/useDashboardStats';
import { createLogger } from '@/utils/logger';

const logger = createLogger('Dashboard');

const Dashboard = () => {
  logger.debug('Dashboard component rendering');
  
  // Get patients and queue data 
  const { patients = [] } = usePatients() || { patients: [] };
  const { waitingQueues = [], activeQueues = [], completedQueues = [] } = useDashboardQueues() || {};
  const todayStats = useDashboardStats(completedQueues || []);

  return (
    <div className="p-6">
      <DashboardHeader />
      
      <QueueSummaryCards 
        waitingQueues={waitingQueues || []}
        activeQueues={activeQueues || []}
        completedQueues={completedQueues || []}
        queues={[...(waitingQueues || []), ...(activeQueues || []), ...(completedQueues || [])]}
        avgWaitTime={todayStats?.avgWaitTime || 0}
        avgServiceTime={todayStats?.avgServiceTime || 0}
      />
      
      <DashboardCards 
        waitingQueues={waitingQueues || []}
        activeQueues={activeQueues || []}
        completedQueues={completedQueues || []}
        patientsCount={patients?.length || 0}
        avgWaitTime={todayStats?.avgWaitTime || 0}
      />
    </div>
  );
};

export default Dashboard;
