import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { usePharmacyQueueData } from "./usePharmacyQueueData";
import PharmacyQueueTabContent from "./components/PharmacyQueueTabContent";
import { Patient } from "@/integrations/supabase/schema";
import PatientInfoDialog from "@/components/pharmacy/PatientInfoDialog";
import QueueTransferDialog from "./QueueTransferDialog";

interface PharmacyQueueTabsProps {
  servicePointId?: string;
  refreshTrigger: number;
}

const PharmacyQueueTabs: React.FC<PharmacyQueueTabsProps> = ({
  servicePointId = "",
  refreshTrigger,
}) => {
  const {
    queuesByStatus,
    getPatientName,
    handleCallQueue,
    handleUpdateStatus,
    handleRecallQueue,
    handleHoldQueue,
    handleTransferQueue,
    handleReturnToWaiting,
    handleCancelQueue,
    getPatientData,
    selectedServicePoint,
    servicePoints,
  } = usePharmacyQueueData({
    servicePointId: servicePointId || "",
    refreshTrigger,
  });
  // Patient info dialog state
  const [patientInfoOpen, setPatientInfoOpen] = React.useState(false);
  const [selectedPatient, setSelectedPatient] = React.useState<Patient | null>(
    null
  );
  const [selectedQueueId, setSelectedQueueId] = React.useState<string | null>(
    null
  );
  const [selectedQueueNumber, setSelectedQueueNumber] = React.useState<string>("");

  const [transferDialogOpen, setTransferDialogOpen] = React.useState(false);
  const [transferQueueId, setTransferQueueId] = React.useState<string | null>(
    null
  );

  const handleViewPatientInfo = (queue: any, _type_tabe: string) => {
    const patient = getPatientData(queue.patient_id);
    if (patient) {
      setSelectedPatient(patient);
      setSelectedQueueId(queue.id);
      setSelectedQueueNumber(queue.number ? `${queue.type}${queue.number}` : "");
      setPatientInfoOpen(true);
    }
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

  const getPatientById = (id: string): Patient => {
    const patient = getPatientData(id);
    return patient;
  };

  return (
    <div className="h-full">
      <Tabs defaultValue="waiting" className="h-full flex flex-col">
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
          <PharmacyQueueTabContent
            value="waiting"
            getPatientById={getPatientById}
            queues={queuesByStatus.waiting}
            emptyMessage="ไม่มีคิวที่รอดำเนินการ"
            getPatientName={getPatientName}
            onViewPatientInfo={handleViewPatientInfo}
            onCallQueue={handleCallQueue}
            onUpdateStatus={handleUpdateStatus}
          />

          <PharmacyQueueTabContent
            value="active"
            getPatientById={getPatientById}
            queues={queuesByStatus.active}
            emptyMessage="ไม่มีคิวที่กำลังให้บริการ"
            getPatientName={getPatientName}
            onViewPatientInfo={handleViewPatientInfo}
            onUpdateStatus={handleUpdateStatus}
            onRecallQueue={handleRecallQueue}
            onHoldQueue={handleHoldQueue}
            onTransferClick={handleTransferClick}
          />

          <PharmacyQueueTabContent
            value="paused"
            getPatientById={getPatientById}
            queues={queuesByStatus.paused}
            emptyMessage="ไม่มีคิวที่พัก"
            getPatientName={getPatientName}
            onViewPatientInfo={handleViewPatientInfo}
            onCallQueue={handleCallQueue}
            onReturnToWaiting={handleReturnToWaiting}
            onUpdateStatus={handleUpdateStatus}
          />

          <PharmacyQueueTabContent
            value="skipped"
            getPatientById={getPatientById}
            queues={queuesByStatus.skipped}
            emptyMessage="ไม่มีคิวที่ถูกข้าม"
            getPatientName={getPatientName}
            onViewPatientInfo={handleViewPatientInfo}
            onReturnToWaiting={handleReturnToWaiting}
            onCancelQueue={handleCancelQueue}
          />

          <PharmacyQueueTabContent
            value="completed"
            getPatientById={getPatientById}
            queues={queuesByStatus.completed}
            emptyMessage="ไม่มีคิวที่เสร็จสิ้น"
            getPatientName={getPatientName}
            onViewPatientInfo={handleViewPatientInfo}
            isCompleted={true}
          />
        </div>
      </Tabs>
      <PatientInfoDialog
        open={patientInfoOpen}
        onOpenChange={setPatientInfoOpen}
        patient={selectedPatient}
        queueId={selectedQueueId || undefined}
        queueNumber={selectedQueueNumber}
        mode="view"
        showCheckNotes={false}
      />
      <QueueTransferDialog
        open={transferDialogOpen}
        onOpenChange={setTransferDialogOpen}
        onTransfer={handleConfirmTransfer}
        servicePoints={servicePoints}
        currentServicePointId={selectedServicePoint?.id || ""}
      />
    </div>
  );
};

export default PharmacyQueueTabs;
