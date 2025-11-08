import React from "react";
import DashboardContent from "@/components/dashboard/DashboardContent";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useQueues } from "@/hooks/useQueues";
import { usePatients } from "@/hooks/usePatients";
import { useDashboardQueues } from "@/components/dashboard/useDashboardQueues";

const Dashboard: React.FC = () => {
  const { updateQueueStatus, callQueue, recallQueue } = useQueues();

  const { patients } = usePatients();

  const { waitingQueues, activeQueues, completedQueues, skippedQueues } =
    useDashboardQueues();

  return (
    <div className="flex flex-col h-screen overflow-hidden p-6">
      <DashboardHeader />
      <DashboardContent
        waitingQueues={waitingQueues}
        activeQueues={activeQueues}
        completedQueues={completedQueues}
        skippedQueues={skippedQueues}
        patients={patients}
        onUpdateStatus={updateQueueStatus}
        onCallQueue={callQueue}
        onRecallQueue={recallQueue}
      />
    </div>
  );
};

export default Dashboard;
