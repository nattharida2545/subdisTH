
import * as React from 'react';
import { usePatientSearch } from './patient/usePatientSearch';
import { usePatientSelection } from './patient/usePatientSelection';
import { useNewPatientCreation } from './patient/useNewPatientCreation';
import { useQueueCreation } from './queue/useQueueCreation';

export const useCreateQueue = (
  onOpenChange: (open: boolean) => void,
  onCreateQueue: (queue: any) => void
) => {
  // Get patient search functionality
  const { 
    phoneNumber, 
    setPhoneNumber, 
    isSearching, 
    handlePhoneSearch: searchPatientsByPhone,
    matchedPatients: foundPatients,
    showNewPatientForm: showNewForm,
    setShowNewPatientForm
  } = usePatientSearch();
  
  const [matchedPatients, setMatchedPatients] = React.useState<any[]>([]);
  const [localShowNewPatientForm, setLocalShowNewPatientForm] = React.useState(false);

  React.useEffect(() => {
    setMatchedPatients(foundPatients || []);
    setLocalShowNewPatientForm(showNewForm);
  }, [foundPatients, showNewForm]);

  // Get patient selection functionality
  const {
    patientId,
    setPatientId,
    newPatientName,
    setNewPatientName,
    selectedPatientName,
    selectedPatientPhone,
    finalPatientName,
    finalPatientPhone,
    handleSelectPatient: selectPatientFromList,
    updateFinalPatientInfo,
    resetPatientSelection
  } = usePatientSelection();

  // Get new patient creation functionality
  const { createNewPatient } = useNewPatientCreation();

  // Get queue creation functionality
  const {
    queueType,
    setQueueType,
    notes,
    setNotes,
    qrDialogOpen,
    setQrDialogOpen,
    createdQueueNumber,
    createdQueueType,
    createdPurpose,
    queueTypePurposes,
    createQueue,
    resetQueueCreation
  } = useQueueCreation();

  // Reset all state
  const resetState = React.useCallback(() => {
    setPhoneNumber('');
    setMatchedPatients([]);
    setLocalShowNewPatientForm(false);
    setShowNewPatientForm(false);
    resetPatientSelection();
    resetQueueCreation();
  }, [setPhoneNumber, setShowNewPatientForm, resetPatientSelection, resetQueueCreation]);

  // Handle phone search
  const handlePhoneSearch = async () => {
    if (phoneNumber) {
      // Use the hook's function but fetch patient data from the API
      const patients = await searchPatientsByPhone();
      setMatchedPatients(patients || []);
      
      // If no patients found, show new patient form
      if (patients.length === 0) {
        setLocalShowNewPatientForm(true);
        setShowNewPatientForm(true);
      } else {
        setLocalShowNewPatientForm(false);
        setShowNewPatientForm(false);
      }
    }
  };

  // Handle adding a new patient
  const handleAddNewPatient = () => {
    setLocalShowNewPatientForm(true);
    setShowNewPatientForm(true);
    setPatientId('');  // Clear any selected patient
  };

  // Handle selecting a patient
  const handleSelectPatient = (id: string) => {
    setLocalShowNewPatientForm(false);
    setShowNewPatientForm(false);
    setPatientId(id);
    selectPatientFromList(id, matchedPatients);
  };

  // Handle creating a queue
  const handleCreateQueue = async () => {
    if (localShowNewPatientForm && newPatientName) {
      // Create new patient first
      const newPatient = await createNewPatient(newPatientName, phoneNumber);
      if (newPatient) {
        // Create queue for new patient
        await createQueue(
          newPatient.id,
          newPatient.name,
          phoneNumber,
          updateFinalPatientInfo,
          onCreateQueue,
          onOpenChange
        );
      }
    } else if (patientId) {
      // Create queue for existing patient
      await createQueue(
        patientId,
        selectedPatientName,
        selectedPatientPhone,
        updateFinalPatientInfo,
        onCreateQueue,
        onOpenChange
      );
    }
  };

  return {
    phoneNumber,
    setPhoneNumber,
    isSearching,
    matchedPatients,
    showNewPatientForm: localShowNewPatientForm,
    newPatientName,
    setNewPatientName,
    patientId,
    queueType,
    setQueueType,
    notes,
    setNotes,
    qrDialogOpen,
    setQrDialogOpen,
    createdQueueNumber,
    createdQueueType,
    createdPurpose,
    finalPatientName,
    finalPatientPhone,
    queueTypePurposes,
    handlePhoneSearch,
    handleAddNewPatient,
    handleSelectPatient,
    handleCreateQueue,
    resetState
  };
};
