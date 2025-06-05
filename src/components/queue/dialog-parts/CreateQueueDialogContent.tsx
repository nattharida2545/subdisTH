
import * as React from 'react';
import PhoneSearchSection from '../dialogs/PhoneSearchSection';
import PatientResultsList from '../dialogs/PatientResultsList';
import NewPatientForm from '../dialogs/NewPatientForm';
import QueueDetailsForm from '../dialogs/QueueDetailsForm';
import { createLogger } from '@/utils/logger';
import { QueueType } from '@/integrations/supabase/schema';

const logger = createLogger('CreateQueueDialogContent');

interface CreateQueueDialogContentProps {
  // Patient search
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  isSearching: boolean;
  matchedPatients: any[];
  handlePhoneSearch: () => void;
  
  // Patient selection
  patientId: string;
  handleSelectPatient: (id: string) => void;
  
  // New patient
  showNewPatientForm: boolean;
  newPatientName: string;
  setNewPatientName: (value: string) => void;
  handleAddNewPatient: () => void;
  
  // Queue details
  queueType: QueueType;
  setQueueType: (value: QueueType) => void;
  notes: string;
  setNotes: (value: string) => void;
  queueTypePurposes: Record<string, string>;
}

const CreateQueueDialogContent: React.FC<CreateQueueDialogContentProps> = ({
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
  
  // Queue details
  queueType,
  setQueueType,
  notes,
  setNotes,
  queueTypePurposes,
}) => {
  logger.verbose('Rendering CreateQueueDialogContent');
  
  // Calculate if we should show the queue details section
  const shouldShowQueueDetails = Boolean(patientId) || (showNewPatientForm && Boolean(newPatientName));

  return (
    <div className="grid gap-4 py-4">
      <PhoneSearchSection 
        phoneNumber={phoneNumber}
        setPhoneNumber={setPhoneNumber}
        handlePhoneSearch={handlePhoneSearch}
        isSearching={isSearching}
      />

      <PatientResultsList 
        matchedPatients={matchedPatients}
        patientId={patientId}
        handleSelectPatient={handleSelectPatient}
        handleAddNewPatient={handleAddNewPatient}
      />

      <NewPatientForm 
        newPatientName={newPatientName}
        setNewPatientName={setNewPatientName}
        showNewPatientForm={showNewPatientForm}
      />
      
      <QueueDetailsForm 
        queueType={queueType}
        setQueueType={setQueueType}
        notes={notes}
        setNotes={setNotes}
        queueTypePurposes={queueTypePurposes}
        shouldShow={shouldShowQueueDetails}
      />
    </div>
  );
};

export default CreateQueueDialogContent;
