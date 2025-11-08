import * as React from "react";
import PhoneSearchSection from "../dialogs/PhoneSearchSection";
import PatientResultsList from "../dialogs/PatientResultsList";
import NewPatientForm from "../dialogs/NewPatientForm";
import QueueDetailsForm from "../dialogs/QueueDetailsForm";
import { createLogger } from "@/utils/logger";
import { QueueType } from "@/integrations/supabase/schema";
import { SearchType } from "../dialogs/hooks/patient/types";
import PhoneInput from "../dialogs/PhoneInput";
import IdCardInput from "../dialogs/IdCardInput";

const logger = createLogger("CreateQueueDialogContent");

interface CreateQueueDialogContentProps {
  // Patient search
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  idCardNumber?: string;
  setIdCardNumber?: (value: string) => void;
  searchType?: SearchType;
  setSearchType?: (value: SearchType) => void;
  isSearching: boolean;
  matchedPatients: any[];
  handleSearch: () => void;
  handlePhoneSearch?: () => void; // For backward compatibility

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
  idCardNumber = "",
  setIdCardNumber = () => {},
  searchType = "phone",
  setSearchType = () => {},
  isSearching,
  matchedPatients,
  handleSearch,

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
  logger.verbose("Rendering CreateQueueDialogContent");

  // Calculate if we should show the queue details section
  const shouldShowQueueDetails =
    Boolean(patientId) || (showNewPatientForm && Boolean(newPatientName));

  // Control when to show the ID card and phone input fields
  // Show them after search is completed and when a patient is selected or new patient form is shown
  const showIdCardInput = Boolean(showNewPatientForm);
  const showPhoneInput = Boolean(showNewPatientForm);

  console.log("matchedPatients", matchedPatients);
  console.log("showNewPatientForm", showNewPatientForm);

  return (
    <div className="grid gap-4 py-4">
      <PhoneSearchSection
        phoneNumber={phoneNumber}
        setPhoneNumber={setPhoneNumber}
        idCardNumber={idCardNumber}
        setIdCardNumber={setIdCardNumber}
        searchType={searchType}
        setSearchType={setSearchType}
        handleSearch={handleSearch}
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

      {searchType === "phone" ? (
        <IdCardInput
          idCardNumber={idCardNumber}
          setIdCardNumber={setIdCardNumber}
          onEnterPress={handleSearch}
          disabled={isSearching}
          showIdCardInput={showIdCardInput}
        />
      ) : (
        <PhoneInput
          phoneNumber={phoneNumber}
          setPhoneNumber={setPhoneNumber}
          onEnterPress={handleSearch}
          disabled={isSearching}
          showPhoneInput={showPhoneInput}
        />
      )}

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
