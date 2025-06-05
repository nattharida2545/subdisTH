
import React from 'react';
import PatientInfoDialog from '@/components/pharmacy/PatientInfoDialog';
import QueueTransferDialog from '../QueueTransferDialog';
import { formatQueueNumber } from '@/utils/queueFormatters';

interface PharmacyQueueDialogsProps {
  selectedPatient: any;
  patientDialogOpen: boolean;
  setPatientDialogOpen: (open: boolean) => void;
  transferDialogOpen: boolean;
  setTransferDialogOpen: (open: boolean) => void;
  onTransferConfirm: (targetServicePointId: string) => Promise<void>;
  servicePoints: any[];
  servicePointId: string;
}

const PharmacyQueueDialogs: React.FC<PharmacyQueueDialogsProps> = ({
  selectedPatient,
  patientDialogOpen,
  setPatientDialogOpen,
  transferDialogOpen,
  setTransferDialogOpen,
  onTransferConfirm,
  servicePoints,
  servicePointId
}) => {
  return (
    <>
      {/* Patient Info Dialog */}
      <PatientInfoDialog
        open={patientDialogOpen}
        onOpenChange={setPatientDialogOpen}
        patient={selectedPatient}
        queueNumber={selectedPatient ? formatQueueNumber('GENERAL', selectedPatient.number || 0) : undefined}
      />

      {/* Transfer Dialog */}
      <QueueTransferDialog
        open={transferDialogOpen}
        onOpenChange={setTransferDialogOpen}
        onTransfer={onTransferConfirm}
        servicePoints={servicePoints}
        currentServicePointId={servicePointId}
      />
    </>
  );
};

export default PharmacyQueueDialogs;
