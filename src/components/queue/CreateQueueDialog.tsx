
import * as React from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import QueueCreatedDialog from './QueueCreatedDialog';
import { createLogger } from '@/utils/logger';
import { useCreateQueue } from './dialogs/hooks/create-queue';
import CreateQueueDialogContent from './dialog-parts/CreateQueueDialogContent';
import CreateQueueFooterActions from './dialog-parts/CreateQueueFooterActions';

const logger = createLogger('CreateQueueDialog');

interface CreateQueueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateQueue: (queue: any) => void;
}

const CreateQueueDialog: React.FC<CreateQueueDialogProps> = ({
  open,
  onOpenChange,
  onCreateQueue,
}) => {
  logger.verbose(`Rendering with open=${open}`);
  
  // Use our refactored hook that combines all queue creation functionality
  const {
    // Patient search
    phoneNumber,
    setPhoneNumber,
    isSearching,
    matchedPatients,
    handlePhoneSearch,
    
    // Patient selection
    patientId,
    handleSelectPatient,
    
    // New patient
    showNewPatientForm,
    newPatientName,
    setNewPatientName,
    handleAddNewPatient,
    
    // Queue creation
    queueType,
    setQueueType,
    notes,
    setNotes,
    queueTypePurposes,
    
    // Queue dialog
    qrDialogOpen,
    setQrDialogOpen,
    createdQueueNumber,
    createdQueueType,
    createdPurpose,
    
    // Final patient info
    finalPatientName,
    finalPatientPhone,
    finalPatientLineId,
    
    // Actions
    handleCreateQueue,
    resetState
  } = useCreateQueue(onOpenChange, onCreateQueue);
  
  // Reset state when dialog is closed
  React.useEffect(() => {
    if (!open) {
      logger.debug('Dialog closed, resetting state');
      resetState();
    } else {
      logger.debug('Dialog opened');
    }
  }, [open, resetState]);

  // Determine if the create queue button should be disabled
  const isCreateQueueDisabled = !patientId && !(showNewPatientForm && newPatientName);
  
  // Handle cancel button click
  const handleCancel = React.useCallback(() => {
    logger.debug('Cancel button clicked');
    onOpenChange(false);
  }, [onOpenChange]);

  // Handle complete reset when QueueCreatedDialog closes
  const handleQueueCreatedDialogClose = React.useCallback(() => {
    logger.debug('QueueCreatedDialog closed, performing complete reset');
    resetState();
    // Also close the main create queue dialog to return to clean state
    onOpenChange(false);
  }, [resetState, onOpenChange]);

  return (
    <>
      <Dialog 
        open={open} 
        onOpenChange={(newOpen) => {
          logger.debug(`Dialog onOpenChange called with: ${newOpen}`);
          onOpenChange(newOpen);
        }}
      >
        <DialogContent className="sm:max-w-[425px] bg-background">
          <DialogHeader>
            <DialogTitle>สร้างคิวใหม่</DialogTitle>
          </DialogHeader>
          
          <CreateQueueDialogContent 
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            isSearching={isSearching}
            matchedPatients={matchedPatients}
            handlePhoneSearch={handlePhoneSearch}
            patientId={patientId}
            handleSelectPatient={handleSelectPatient}
            showNewPatientForm={showNewPatientForm}
            newPatientName={newPatientName}
            setNewPatientName={setNewPatientName}
            handleAddNewPatient={handleAddNewPatient}
            queueType={queueType}
            setQueueType={setQueueType}
            notes={notes}
            setNotes={setNotes}
            queueTypePurposes={queueTypePurposes}
          />
          
          <DialogFooter>
            <CreateQueueFooterActions 
              onCancel={handleCancel}
              onCreateQueue={() => handleCreateQueue()}
              isDisabled={isCreateQueueDisabled}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <QueueCreatedDialog 
        open={qrDialogOpen && createdQueueNumber !== null} 
        onOpenChange={setQrDialogOpen}
        queueNumber={createdQueueNumber || 0}
        queueType={createdQueueType || 'GENERAL'}
        patientName={finalPatientName}
        patientPhone={finalPatientPhone}
        patientLineId={finalPatientLineId}
        purpose={createdPurpose}
        onDialogClose={handleQueueCreatedDialogClose}
      />
    </>
  );
};

export default CreateQueueDialog;
