import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QueueList from "@/components/queue/QueueList";
import {
  Queue,
  QueueStatus,
  Patient,
  ServicePoint,
} from "@/integrations/supabase/schema";

interface QueueTabsProps {
  waitingQueues: Queue[];
  activeQueues: Queue[];
  completedQueues: Queue[];
  skippedQueues: Queue[];
  patients: Patient[];
  onUpdateStatus: (
    queueId: string,
    status: QueueStatus
  ) => Promise<Queue | null>;
  onCallQueue: (queueId: string) => Promise<Queue | null>;
  onRecallQueue: (queueId: string) => void;
  selectedServicePoint?: ServicePoint | null;
}

const QueueTabs: React.FC<QueueTabsProps> = ({
  waitingQueues,
  activeQueues,
  completedQueues,
  skippedQueues,
  patients,
  onUpdateStatus,
  onCallQueue,
  onRecallQueue,
  selectedServicePoint,
}) => {
  // Function to get patient name by ID
  const getPatientName = (patientId: string): string => {
    const patient = patients.find((p) => p.id === patientId);
    return patient ? patient.name : "ไม่พบชื่อผู้ป่วย";
  };

  const getPatientById = (id: string): Patient => {
    const patient = patients.find((p) => p.id === id);
    return patient;
  };

  return (
    <Tabs defaultValue="waiting" className="w-full">
      <TabsList className="mb-4 w-full justify-start overflow-x-auto pb-1 no-scrollbar sticky top-0 z-10 bg-white">
        <TabsTrigger value="waiting" className="min-w-fit">
          รอดำเนินการ ({waitingQueues.length})
        </TabsTrigger>
        <TabsTrigger value="active" className="min-w-fit">
          กำลังให้บริการ ({activeQueues.length})
        </TabsTrigger>
        <TabsTrigger value="completed" className="min-w-fit">
          เสร็จสิ้น ({completedQueues.length})
        </TabsTrigger>
        <TabsTrigger value="skipped" className="min-w-fit">
          ข้ามไปแล้ว ({skippedQueues.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="waiting" className="animate-fade-in">
        <QueueList
          queues={waitingQueues}
          getPatientName={getPatientName}
          getPatientById={getPatientById}
          status="WAITING"
          onUpdateStatus={onUpdateStatus}
          onCallQueue={onCallQueue}
          onRecallQueue={onRecallQueue}
          selectedServicePoint={selectedServicePoint}
        />
      </TabsContent>

      <TabsContent value="active" className="animate-fade-in">
        <QueueList
          queues={activeQueues}
          getPatientName={getPatientName}
          getPatientById={getPatientById}
          status="ACTIVE"
          onUpdateStatus={onUpdateStatus}
          onCallQueue={onCallQueue}
          onRecallQueue={onRecallQueue}
          selectedServicePoint={selectedServicePoint}
        />
      </TabsContent>

      <TabsContent value="completed" className="animate-fade-in">
        <QueueList
          queues={completedQueues}
          getPatientName={getPatientName}
          getPatientById={getPatientById}
          status="COMPLETED"
          onUpdateStatus={onUpdateStatus}
          onCallQueue={onCallQueue}
          onRecallQueue={onRecallQueue}
          selectedServicePoint={selectedServicePoint}
        />
      </TabsContent>

      <TabsContent value="skipped" className="animate-fade-in">
        <QueueList
          queues={skippedQueues}
          getPatientName={getPatientName}
          getPatientById={getPatientById}
          status="SKIPPED"
          onUpdateStatus={onUpdateStatus}
          onCallQueue={onCallQueue}
          onRecallQueue={onRecallQueue}
          selectedServicePoint={selectedServicePoint}
        />
      </TabsContent>
    </Tabs>
  );
};

export default QueueTabs;
