
import React from 'react';
import QueueManagementHeader from './QueueManagementHeader';
import QueueTabsContainer from './QueueTabsContainer';
import PatientInfoDialog from '../../pharmacy/PatientInfoDialog';
import QueueTransferDialogContainer from './QueueTransferDialogContainer';
import { useQueueManagement } from '@/hooks/queue/useQueueManagement';
import { useQueueRealtime } from '@/hooks/useQueueRealtime';
import { usePatients } from '@/hooks/usePatients';
import { Patient, Queue } from '@/integrations/supabase/schema';

const QueueManagementContainer: React.FC = () => {
  const {
    waitingQueues,
    activeQueues,
    completedQueues,
    skippedQueues,
    patients,
    queueTypes,
    selectedServicePoint,
    servicePoints,
    isCancellingAll,
    handleRecallQueue,
    handleCallQueue,
    handleTransferQueue,
    handleHoldQueue,
    handleReturnToWaiting,
    handleServicePointChange,
    handleCancelAllQueues,
    updateQueueStatus,
    getIntelligentServicePointSuggestion
  } = useQueueManagement();

  // Patient info dialog state
  const [patientInfoOpen, setPatientInfoOpen] = React.useState(false);
  const [selectedPatient, setSelectedPatient] = React.useState<Patient | null>(null);

  // Transfer dialog state
  const [transferDialogOpen, setTransferDialogOpen] = React.useState(false);
  const [queueToTransfer, setQueueToTransfer] = React.useState<Queue | null>(null);

  // Handle patient info view
  const handleViewPatientInfo = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      setSelectedPatient(patient);
      setPatientInfoOpen(true);
    }
  };

  // Handle transfer queue button click
  const handleTransferQueueClick = (queueId: string) => {
    const queue = activeQueues.find(q => q.id === queueId);
    if (queue) {
      setQueueToTransfer(queue);
      setTransferDialogOpen(true);
    }
  };

  // Add dedicated real-time updates for queue management
  useQueueRealtime({
    onQueueChange: React.useCallback(() => {
      // Force refresh of queue data when changes are detected
      window.location.reload();
    }, []),
    channelName: 'queue-management-realtime',
    enabled: true,
    debounceMs: 200
  });

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Enhanced Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <QueueManagementHeader 
              waitingQueuesCount={waitingQueues.length}
              onCancelAllQueues={handleCancelAllQueues}
              isCancellingAll={isCancellingAll}
            />
          </div>
          
          {/* Enhanced Service Point Info */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>แสดงคิวทั้งหมด</span>
            </div>
            <span className="text-gray-400">•</span>
            <span>ระบบจะแนะนำจุดบริการที่เหมาะสมอัตโนมัติ</span>
          </div>
        </div>
      </div>
      
      {/* Enhanced Content Area */}
      <div className="flex-1 overflow-hidden">
        <QueueTabsContainer
          waitingQueues={waitingQueues}
          activeQueues={activeQueues}
          completedQueues={completedQueues}
          skippedQueues={skippedQueues}
          patients={patients}
          queueTypes={queueTypes}
          onUpdateStatus={updateQueueStatus}
          onCallQueue={handleCallQueue}
          onRecallQueue={handleRecallQueue}
          onTransferQueue={handleTransferQueue}
          onHoldQueue={handleHoldQueue}
          onReturnToWaiting={handleReturnToWaiting}
          onViewPatientInfo={handleViewPatientInfo}
          selectedServicePoint={selectedServicePoint}
          servicePoints={servicePoints}
          getIntelligentServicePointSuggestion={getIntelligentServicePointSuggestion}
          onTransferQueueClick={handleTransferQueueClick}
        />
      </div>

      {/* Patient Info Dialog - Using the pharmacy component */}
      <PatientInfoDialog
        open={patientInfoOpen}
        onOpenChange={setPatientInfoOpen}
        patient={selectedPatient}
      />

      {/* Transfer Dialog */}
      <QueueTransferDialogContainer
        queueToTransfer={queueToTransfer}
        transferDialogOpen={transferDialogOpen}
        onOpenChange={setTransferDialogOpen}
        servicePoints={servicePoints}
        queueTypes={queueTypes}
        onTransfer={handleTransferQueue}
      />
    </div>
  );
};

export default QueueManagementContainer;
