import * as React from "react";
import { toast } from "sonner";
import { createLogger } from "@/utils/logger";
import { usePatientInfoHook } from "./usePatientInfoHook";
import { useQueueActions } from "./useQueueActions";
import {
  CreateQueueHookProps,
  CreateQueueHookReturn,
  QueueCreationResult,
} from "@/components/queue/hooks/types";
import { QueueType } from "@/integrations/supabase/schema";
import { SearchType } from "../patient/types";

const logger = createLogger("useCreateQueueHook");

/**
 * Main hook for queue creation functionality
 * Combines patient information, queue dialog state, and queue actions
 */
export const useCreateQueueHook = (
  onOpenChange: (open: boolean) => void,
  onCreateQueue: (queue: QueueCreationResult) => void
): CreateQueueHookReturn => {
  logger.debug("Initializing useCreateQueueHook");

  // Get patient information from the patient info hook
  const {
    patientSearchState,
    patientSelectionState,
    newPatientCreationState,
    patientInfo,
    handleSelectPatient,
    handleAddNewPatient,
    resetPatientState,
  } = usePatientInfoHook();

  // Get queue actions from the queue actions hook
  const {
    queueState,
    dialogState,
    createQueueForPatient,
    resetQueueState,
    resetDialogState,
  } = useQueueActions();

  // Function to handle queue creation
  const handleCreateQueue =
    React.useCallback(async (): Promise<QueueCreationResult | null> => {
      logger.info("Creating queue...");

      try {
        // Validate required fields
        if (!patientInfo.patientId && !patientInfo.newPatientName) {
          toast.error("กรุณาเลือกผู้ป่วยหรือสร้างผู้ป่วยใหม่");
          logger.warn("No patient selected or created");
          return null;
        }

        // Create the queue
        const createdQueue = await createQueueForPatient(
          patientInfo.patientId,
          patientInfo.newPatientName,
          patientSearchState.phoneNumber,
          patientSearchState.idCardNumber // Add ID card number
        );

        if (createdQueue) {
          // Update parent component with created queue
          onCreateQueue(createdQueue);
          logger.info("Queue created successfully", {
            queueNumber: createdQueue.number,
          });
          return createdQueue;
        }

        return null;
      } catch (err) {
        logger.error("Error creating queue:", err);
        toast.error("เกิดข้อผิดพลาดในการสร้างคิว");
        return null;
      }
    }, [
      patientInfo.patientId,
      patientInfo.newPatientName,
      patientSearchState.phoneNumber,
      patientSearchState.idCardNumber, // Add ID card number to dependencies
      createQueueForPatient,
      onCreateQueue,
    ]);

  // Function to reset all state - enhanced to clear everything
  const resetState = React.useCallback(() => {
    logger.debug("Resetting all state completely");
    resetPatientState();
    resetQueueState();
    resetDialogState();

    // Force reset of patient search state
    patientSearchState.resetPatientSearch();
    patientSelectionState.resetPatientSelection();
    newPatientCreationState.resetNewPatientCreation();
  }, [
    resetPatientState,
    resetQueueState,
    resetDialogState,
    patientSearchState,
    patientSelectionState,
    newPatientCreationState,
  ]);

  // Create the return object with all properties needed by the dialog
  return {
    // Patient search
    phoneNumber: patientSearchState.phoneNumber,
    setPhoneNumber: patientSearchState.setPhoneNumber,
    idCardNumber: patientSearchState.idCardNumber,
    setIdCardNumber: patientSearchState.setIdCardNumber,
    searchType: patientSearchState.searchType,
    setSearchType: patientSearchState.setSearchType,
    isSearching: patientSearchState.isSearching,
    matchedPatients: patientSearchState.matchedPatients,
    handleSearch: patientSearchState.handleSearch,
    handlePhoneSearch: patientSearchState.handlePhoneSearch,

    // Patient selection
    patientId: patientSelectionState.patientId,
    handleSelectPatient,

    // New patient
    showNewPatientForm: newPatientCreationState.showNewPatientForm,
    newPatientName: newPatientCreationState.newPatientName,
    setNewPatientName: newPatientCreationState.setNewPatientName,
    handleAddNewPatient,

    // Queue creation
    queueType: queueState.queueType as QueueType,
    setQueueType: queueState.setQueueType,
    notes: queueState.notes,
    setNotes: queueState.setNotes,
    queueTypePurposes: queueState.queueTypePurposes,

    // Queue dialog
    qrDialogOpen: dialogState.qrDialogOpen,
    setQrDialogOpen: dialogState.setQrDialogOpen,
    createdQueueNumber: dialogState.createdQueueNumber,
    createdQueueType: dialogState.createdQueueType as QueueType,
    createdPurpose: dialogState.createdPurpose,

    // Final patient info
    finalPatientName: patientInfo.finalPatientName,
    finalPatientPhone: patientInfo.finalPatientPhone,
    finalPatientLineId: patientInfo.finalPatientLineId,

    // Actions
    handleCreateQueue,
    resetState,
  };
};
