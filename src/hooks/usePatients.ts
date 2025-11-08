import * as React from "react";
import { usePatientsState } from "./patients/usePatientsState";
import { usePatientsActions } from "./patients/usePatientsActions";
import { usePatientsSearch } from "./patients/usePatientsSearch";

export const usePatients = () => {
  try {
    const {
      patients = [],
      setPatients,
      loading = false,
      error = null,
      fetchPatients = async () => {},
    } = usePatientsState() || {};

    const {
      actionError = null,
      addPatient = async () => null,
      updatePatient = async () => null,
      deletePatient = async () => false,
    } = usePatientsActions(patients, setPatients) || {};

    const {
      searchLoading = false,
      searchError = null,
      searchPatients = async () => [],
      findPatientByPhone = async () => null,
    } = usePatientsSearch() || {};

    return {
      // State
      patients,
      loading,
      error: error || actionError || searchError,

      // Actions
      fetchPatients,
      addPatient,
      updatePatient,
      deletePatient,

      // Search
      searchPatients,
      findPatientByPhone,
      searchLoading,
    };
  } catch (err) {
    console.error("Error in usePatients hook:", err);
    // Return safe defaults to prevent crashes
    return {
      patients: [],
      loading: false,
      error: String(err),
      fetchPatients: async () => {},
      addPatient: async () => null,
      updatePatient: async () => null,
      deletePatient: async () => false,
      searchPatients: async () => [],
      findPatientByPhone: async () => null,
      searchLoading: false,
    };
  }
};
