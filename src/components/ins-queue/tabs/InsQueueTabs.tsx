import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import InsQueueTabContent from "./components/InsQueueTabContent";
import { QueueIns, Patient } from "@/integrations/supabase/schema";
import { useInsQueueData } from "./useInsQueueData";
import InsQueueTransferDialog from "./InsQueueTransferDialog";
import PatientInfoDialog from "@/components/pharmacy/PatientInfoDialog";
import { supabase } from "@/integrations/supabase/client";

interface InsQueueTabsProps {
  servicePointId?: string;
  refreshTrigger: number;
}

const InsQueueTabs: React.FC<InsQueueTabsProps> = ({
  servicePointId = "",
  refreshTrigger,
}) => {
  // Add state for current tab value
  const [currentTab, setCurrentTab] = React.useState<string>("waiting");
  const {
    queuesByStatus,
    getIdCard,
    handleCallQueue,
    handleUpdateStatus,
    handleRecallQueue,
    handleHoldQueue,
    handleTransferQueue,
    handleReturnToWaiting,
    handleCancelQueue,
    selectedServicePoint,
    servicePoints,
  } = useInsQueueData({
    servicePointId: servicePointId || "",
    refreshTrigger,
  });

  // Patient info dialog state
  const [patientInfoOpen, setPatientInfoOpen] = React.useState(false);
  const [selectedPatient, setSelectedPatient] = React.useState<Patient | null>(
    null
  );
  const [selectedQueueNumber, setSelectedQueueNumber] = React.useState<string>("");
  const [selectedQueueId, setSelectedQueueId] = React.useState<string | null>(null);

  const [transferDialogOpen, setTransferDialogOpen] = React.useState(false);
  const [transferQueueId, setTransferQueueId] = React.useState<string | null>(
    null
  );

  const handleViewPatientInfo = async (queue: QueueIns, _type_tab: string) => {
    let patient: Patient | null = null;

    // Try to find patient by ID_card first
    if (queue.ID_card) {
      try {
        const { data, error } = await supabase
          .from("patients")
          .select("*")
          .eq("ID_card", queue.ID_card)
          .single();

        if (!error && data) {
          patient = data;
          console.log("Found patient by ID_card:", patient);
        }
      } catch (error) {
        console.log("Patient not found by ID_card, will create from queue data");
      }
    }

    // If patient not found, create Patient object from QueueIns data
    if (!patient) {
      patient = {
        id: queue.id, // Use queue ID as patient ID for INS
        patient_id: queue.ID_card || queue.id, // Use ID_card or queue ID
        name: queue.full_name || "ไม่ระบุชื่อ",
        phone: queue.phone_number || "",
        address: queue.house_number || queue.moo 
          ? `${queue.house_number ? `บ้านเลขที่ ${queue.house_number}` : ""}${queue.house_number && queue.moo ? " " : ""}${queue.moo ? `หมู่ ${queue.moo}` : ""}`
          : "",
        ID_card: queue.ID_card,
        created_at: queue.created_at || new Date().toISOString(),
        updated_at: queue.created_at || new Date().toISOString(),
      };
      console.log("Created patient from queue data:", patient);
    }
    
    setSelectedPatient(patient);
    setSelectedQueueNumber(`${queue.type}${queue.number}`);
    setSelectedQueueId(queue.id);
    setPatientInfoOpen(true);
  };

  const handleTransferClick = (queueId: string) => {
    setTransferQueueId(queueId);
    setTransferDialogOpen(true);
  };

  const handleConfirmTransfer = async (targetServicePointId: string) => {
    if (!transferQueueId) return;
    await handleTransferQueue(transferQueueId, targetServicePointId);
    setTransferDialogOpen(false);
    setTransferQueueId(null);
  };

  console.log("queuesByStatus", queuesByStatus);

  return (
    <div className="h-full">
      <Tabs
        defaultValue="waiting"
        className="h-full flex flex-col"
        value={currentTab}
        onValueChange={setCurrentTab}
      >
        <TabsList className="grid w-full grid-cols-5 mb-4">
          <TabsTrigger value="waiting" className="flex items-center gap-2">
            รอดำเนินการ
            {queuesByStatus.waiting.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {queuesByStatus.waiting.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="active" className="flex items-center gap-2">
            กำลังให้บริการ
            {queuesByStatus.active.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {queuesByStatus.active.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="paused" className="flex items-center gap-2">
            พัก
            {queuesByStatus.paused.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {queuesByStatus.paused.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="skipped" className="flex items-center gap-2">
            ข้าม
            {queuesByStatus.skipped.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {queuesByStatus.skipped.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            เสร็จสิ้น
            {queuesByStatus.completed.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {queuesByStatus.completed.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-auto">
          <InsQueueTabContent
            value="waiting"
            queues={queuesByStatus.waiting}
            emptyMessage="ไม่มีคิวที่รอดำเนินการ"
            getIdCard={getIdCard}
            onViewPatientInfo={handleViewPatientInfo}
            onCallQueue={handleCallQueue}
            onUpdateStatus={handleUpdateStatus}
            onTabChange={setCurrentTab}
            servicePoints={servicePoints}
            selectedServicePoint={selectedServicePoint}
          />

          <InsQueueTabContent
            value="active"
            queues={queuesByStatus.active}
            emptyMessage="ไม่มีคิวที่กำลังให้บริการ"
            getIdCard={getIdCard}
            onViewPatientInfo={handleViewPatientInfo}
            onUpdateStatus={handleUpdateStatus}
            onRecallQueue={handleRecallQueue}
            onHoldQueue={handleHoldQueue}
            onTransferClick={handleTransferClick}
            onTabChange={setCurrentTab}
            servicePoints={servicePoints}
            selectedServicePoint={selectedServicePoint}
          />

          <InsQueueTabContent
            value="paused"
            queues={queuesByStatus.paused}
            emptyMessage="ไม่มีคิวที่พัก"
            getIdCard={getIdCard}
            onViewPatientInfo={handleViewPatientInfo}
            onCallQueue={handleCallQueue}
            onReturnToWaiting={handleReturnToWaiting}
            onUpdateStatus={handleUpdateStatus}
            onTabChange={setCurrentTab}
            servicePoints={servicePoints}
            selectedServicePoint={selectedServicePoint}
          />

          <InsQueueTabContent
            value="skipped"
            queues={queuesByStatus.skipped}
            emptyMessage="ไม่มีคิวที่ถูกข้าม"
            getIdCard={getIdCard}
            onViewPatientInfo={handleViewPatientInfo}
            onReturnToWaiting={handleReturnToWaiting}
            onCancelQueue={handleCancelQueue}
            onTabChange={setCurrentTab}
            servicePoints={servicePoints}
            selectedServicePoint={selectedServicePoint}
          />

          <InsQueueTabContent
            value="completed"
            queues={queuesByStatus.completed}
            emptyMessage="ไม่มีคิวที่เสร็จสิ้น"
            getIdCard={getIdCard}
            onViewPatientInfo={handleViewPatientInfo}
            isCompleted={true}
            onTabChange={setCurrentTab}
            servicePoints={servicePoints}
            selectedServicePoint={selectedServicePoint}
          />
        </div>
      </Tabs>
      <PatientInfoDialog
        open={patientInfoOpen}
        onOpenChange={setPatientInfoOpen}
        patient={selectedPatient}
        queueNumber={selectedQueueNumber}
        queueId={selectedQueueId || undefined}
        showCheckNotes={true}
      />
      <InsQueueTransferDialog
        open={transferDialogOpen}
        onOpenChange={setTransferDialogOpen}
        onTransfer={handleConfirmTransfer}
        servicePoints={servicePoints}
        currentServicePointId={selectedServicePoint?.id || ""}
      />
    </div>
  );
};

export default InsQueueTabs;
