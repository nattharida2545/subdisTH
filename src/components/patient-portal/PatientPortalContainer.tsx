import React from "react";
import { usePatientPortalState } from "@/hooks/patient-portal/usePatientPortalState";
import { usePatientPortalActions } from "@/hooks/patient-portal/usePatientPortalActions";
import PatientPortalLoading from "@/components/patient-portal/PatientPortalLoading";
import PatientPortalAuth from "@/components/patient-portal/PatientPortalAuth";
import ActiveQueueView from "@/components/patient-portal/ActiveQueueView";
import ActiveQueueInsView from "@/components/patient-portal/ActiveQueueInsView";
import PatientSelectionView from "@/components/patient-portal/PatientSelectionView";
import PatientQueueSelector from "@/components/patient-portal/PatientQueueSelector";

const PatientPortalContainer: React.FC = () => {
  const {
    isAuthenticated,
    loading,
    selectedPatient,
    patients,
    activeQueue,
    activeQueueIns,
    availableQueues,
    availableQueuesIns,
    phoneNumber,
    isStaffMode,
    setIsAuthenticated,
    setSelectedPatient,
    setPatients,
    setActiveQueue,
    setActiveQueueIns,
    setAvailableQueues,
    setAvailableQueuesIns,
    setPhoneNumber,
    setIsStaffMode,
    checkForActiveQueues,
  } = usePatientPortalState();

  const {
    handlePatientSelect,
    handleLineLoginSuccess,
    handlePatientFound,
    handleLogout,
    handleSwitchPatient,
    handleSwitchQueue,
    handleSelectQueue,
    handleClearQueueHistory,
  } = usePatientPortalActions({
    patients,
    setSelectedPatient,
    setActiveQueue,
    setAvailableQueues,
    setIsAuthenticated,
    setIsStaffMode,
    setPhoneNumber,
    setPatients,
    checkForActiveQueues,
  });

  console.log("[PatientPortalContainer] Current state:", {
    isAuthenticated,
    loading,
    selectedPatient: selectedPatient?.name,
    patientsCount: patients.length,
    activeQueue: activeQueue?.id,
    availableQueuesCount: availableQueues.length,
    phoneNumber,
    isStaffMode,
  });

  if (loading) {
    return <PatientPortalLoading />;
  }

  if (!isAuthenticated) {
    console.log(
      "[PatientPortalContainer] Not authenticated, showing auth page"
    );
    return (
      <PatientPortalAuth
        onLoginSuccess={handleLineLoginSuccess}
        onPatientSelect={handlePatientFound}
      />
    );
  }

  // Show queue selector when multiple queues are available but none selected
  if (availableQueues.length > 1 && !activeQueue && selectedPatient) {
    console.log(
      "[PatientPortalContainer] Multiple queues available, showing selector"
    );
    return (
      <PatientQueueSelector
        queues={availableQueues}
        patients={patients}
        onSelectQueue={handleSelectQueue}
        onLogout={handleLogout}
      />
    );
  }

  console.log("activeQueueIns", activeQueueIns);
  console.log("selectedPatient", selectedPatient);

  // Show INS queue view when an INS queue is selected
  if (activeQueueIns && selectedPatient) {
    console.log(
      "[PatientPortalContainer] Active INS queue found, showing INS queue view"
    );
    return (
      <ActiveQueueInsView
        patient={selectedPatient}
        queueIns={activeQueueIns}
        patients={patients}
        onLogout={handleLogout}
        onSwitchPatient={handleSwitchPatient}
        onClearQueueHistory={() => handleClearQueueHistory(selectedPatient)}
      />
    );
  }

  // Show regular queue view when a queue is selected
  if (activeQueue && selectedPatient) {
    console.log(
      "[PatientPortalContainer] Active queue found, showing queue view"
    );
    return (
      <ActiveQueueView
        patient={selectedPatient}
        queue={activeQueue}
        patients={patients}
        availableQueues={availableQueues}
        onLogout={handleLogout}
        onSwitchPatient={handleSwitchPatient}
        onSwitchQueue={
          availableQueues.length > 1 ? handleSwitchQueue : undefined
        }
        onClearQueueHistory={() => handleClearQueueHistory(selectedPatient)}
      />
    );
  }

  // Show patient selection view - this is now the main view for multi-patient management
  console.log("[PatientPortalContainer] Showing patient selection view");
  return (
    <PatientSelectionView
      patients={patients}
      selectedPatient={selectedPatient}
      onSelectPatient={handlePatientSelect}
      onLogout={handleLogout}
      onClearQueueHistory={() =>
        selectedPatient && handleClearQueueHistory(selectedPatient)
      }
    />
  );
};

export default PatientPortalContainer;
