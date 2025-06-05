
import React, { useState } from 'react';
import QueueTabsContainer from '@/components/queue/management/QueueTabsContainer';
import QueueTransferDialogContainer from '@/components/queue/management/QueueTransferDialogContainer';
import PatientInfoDialog from '@/components/pharmacy/PatientInfoDialog';
import { useQueueTransferDialog } from '@/components/queue/transfer';
import { usePharmacyQueueData } from './usePharmacyQueueData';
import { formatQueueNumber } from '@/utils/queueFormatters';
import { usePatients } from '@/hooks/usePatients';

interface PharmacyQueueTabsProps {
  servicePointId?: string;
  refreshTrigger: number;
}

const PharmacyQueueTabs: React.FC<PharmacyQueueTabsProps> = ({
  servicePointId,
  refreshTrigger
}) => {
  // Patient info dialog state
  const [patientDialogOpen, setPatientDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [selectedQueueNumber, setSelectedQueueNumber] = useState<string | undefined>();

  // Get patients data for patient info dialog
  const { patients = [] } = usePatients();

  // Use the properly filtered pharmacy queue data
  const {
    selectedServicePoint,
    queuesByStatus,
    getPatientName,
    getPatientData,
    handleCallQueue,
    handleUpdateStatus,
    handleRecallQueue,
    handleHoldQueue: pharmacyHoldQueue,
    handleTransferQueue: pharmacyTransferQueue,
    handleReturnToWaiting: pharmacyReturnToWaiting,
    handleCancelQueue,
    servicePoints
  } = usePharmacyQueueData({ 
    servicePointId: servicePointId || '',
    refreshTrigger 
  });

  const {
    transferDialogOpen,
    queueToTransfer,
    openTransferDialog,
    closeTransferDialog
  } = useQueueTransferDialog();

  // Create wrapper functions that match QueueTabsContainer expectations
  const handleTransferQueueWrapper = async (
    queueId: string, 
    sourceServicePointId: string,
    targetServicePointId: string,
    notes?: string,
    newQueueType?: string
  ): Promise<boolean> => {
    try {
      await pharmacyTransferQueue(queueId, targetServicePointId);
      return true;
    } catch (error) {
      console.error('Transfer failed:', error);
      return false;
    }
  };

  const handleHoldQueueWrapper = async (
    queueId: string, 
    servicePointId: string, 
    reason?: string
  ): Promise<boolean> => {
    try {
      await pharmacyHoldQueue(queueId);
      return true;
    } catch (error) {
      console.error('Hold failed:', error);
      return false;
    }
  };

  const handleReturnToWaitingWrapper = async (queueId: string): Promise<boolean> => {
    try {
      await pharmacyReturnToWaiting(queueId);
      return true;
    } catch (error) {
      console.error('Return to waiting failed:', error);
      return false;
    }
  };

  // Handler for opening transfer dialog
  const handleTransferQueueClick = (queueId: string) => {
    const allQueues = [
      ...queuesByStatus.waiting,
      ...queuesByStatus.active,
      ...queuesByStatus.completed,
      ...queuesByStatus.skipped,
      ...queuesByStatus.paused
    ];
    const queue = allQueues.find(q => q.id === queueId);
    if (queue) {
      openTransferDialog(queue);
    }
  };

  // Handler for patient info dialog
  const handleViewPatientInfo = (patientId: string) => {
    console.log('View patient info for ID:', patientId);
    
    // Find the patient by ID
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      // Find the queue to get the queue number
      const allQueues = [
        ...queuesByStatus.waiting,
        ...queuesByStatus.active,
        ...queuesByStatus.completed,
        ...queuesByStatus.skipped,
        ...queuesByStatus.paused
      ];
      const queue = allQueues.find(q => q.patient_id === patientId);
      const queueNumber = queue ? formatQueueNumber(queue.type as any, queue.number) : undefined;
      
      setSelectedPatient(patient);
      setSelectedQueueNumber(queueNumber);
      setPatientDialogOpen(true);
    } else {
      console.error('Patient not found:', patientId);
    }
  };

  // Create empty patients array since we're using getPatientName from usePharmacyQueueData
  const emptyPatients: any[] = [];
  const queueTypes: any[] = [];

  return (
    <>
      <QueueTabsContainer
        waitingQueues={queuesByStatus.waiting}
        activeQueues={queuesByStatus.active}
        completedQueues={queuesByStatus.completed}
        skippedQueues={queuesByStatus.skipped}
        patients={emptyPatients}
        queueTypes={queueTypes}
        onUpdateStatus={handleUpdateStatus}
        onCallQueue={handleCallQueue}
        onRecallQueue={handleRecallQueue}
        onTransferQueue={handleTransferQueueWrapper}
        onHoldQueue={handleHoldQueueWrapper}
        onReturnToWaiting={handleReturnToWaitingWrapper}
        onViewPatientInfo={handleViewPatientInfo}
        selectedServicePoint={selectedServicePoint}
        servicePoints={servicePoints}
        onTransferQueueClick={handleTransferQueueClick}
        isPharmacyInterface={true}
        getPatientName={getPatientName}
      />

      <QueueTransferDialogContainer
        queueToTransfer={queueToTransfer}
        transferDialogOpen={transferDialogOpen}
        onOpenChange={closeTransferDialog}
        servicePoints={servicePoints}
        queueTypes={queueTypes}
        onTransfer={handleTransferQueueWrapper}
      />

      {/* Patient Info Dialog */}
      <PatientInfoDialog
        open={patientDialogOpen}
        onOpenChange={setPatientDialogOpen}
        patient={selectedPatient}
        queueNumber={selectedQueueNumber}
      />
    </>
  );
};

export default PharmacyQueueTabs;
