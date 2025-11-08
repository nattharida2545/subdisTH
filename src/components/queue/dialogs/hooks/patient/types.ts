import { Patient } from "@/integrations/supabase/schema";

export type SearchType = "phone" | "id_card";

export interface PatientSearchState {
  phoneNumber: string;
  idCardNumber: string;
  searchType: SearchType;
  isSearching: boolean;
  matchedPatients: Patient[];
  showNewPatientForm: boolean;
}

export interface PatientSearchActions {
  setPhoneNumber: (value: string) => void;
  setIdCardNumber: (value: string) => void;
  setSearchType: (value: SearchType) => void;
  setShowNewPatientForm: (value: boolean) => void;
  handleSearch: () => Promise<Patient[]>;
  handlePhoneSearch: () => Promise<Patient[]>; // For backward compatibility
  resetPatientSearch: () => void;
}

export interface PatientSelectionState {
  patientId: string;
  patientName: string;
  patientPhone: string;
  lineId: string;
  // Additional fields needed by usePatientQueueInfo
  newPatientName: string;
  selectedPatientName: string;
  selectedPatientPhone: string;
  selectedPatientLineId: string;
  finalPatientName: string;
  finalPatientPhone: string;
  finalPatientLineId: string;
}

export interface PatientSelectionActions {
  setPatientId: (value: string) => void;
  setPatientName: (value: string) => void;
  setPatientPhone: (value: string) => void;
  setLineId: (value: string) => void;
  setNewPatientName: (value: string) => void;
  handleSelectPatient: (id: string, patients?: Patient[]) => void;
  resetPatientSelection: () => void;
  // Additional action needed by usePatientQueueInfo
  updateFinalPatientInfo: () => void;
}

export interface NewPatientCreationState {
  newPatientName: string;
  showNewPatientForm: boolean;
}

export interface NewPatientCreationActions {
  setNewPatientName: (value: string) => void;
  setShowNewPatientForm: (value: boolean) => void;
  handleAddNewPatient: () => Promise<any>;
  createNewPatient: (name?: string, phone?: string) => Promise<any>;
  resetNewPatientCreation: () => void;
}

export interface NewPatientCreationResult {
  id: string;
  name: string;
  patient_id: string;
  phone: string;
  line_id?: string;
  [key: string]: any;
}
