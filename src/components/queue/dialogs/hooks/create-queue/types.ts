
import { QueueType } from '@/integrations/supabase/schema';

export interface UseCreateQueueProps {
  onOpenChange: (open: boolean) => void;
  onCreateQueue: (queue: any) => void;
}

export interface UseCreateQueueState {
  // Patient search state
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  isSearching: boolean;
  matchedPatients: any[];
  showNewPatientForm: boolean;
  
  // Patient selection state
  newPatientName: string;
  setNewPatientName: (value: string) => void;
  patientId: string;
  finalPatientName: string;
  finalPatientPhone: string;
  finalPatientLineId: string;
  
  // Queue creation state
  queueType: QueueType;
  setQueueType: (value: QueueType) => void;
  notes: string;
  setNotes: (value: string) => void;
  queueTypePurposes: Record<string, string>;
  
  // QR dialog state
  qrDialogOpen: boolean;
  setQrDialogOpen: (value: boolean) => void;
  createdQueueNumber: number | null;
  createdQueueType: QueueType;
  createdPurpose: string;
  
  // Actions
  handlePhoneSearch: () => Promise<any>;  // Updated return type to be more flexible
  handleAddNewPatient: () => Promise<any>;
  handleSelectPatient: (id: string) => void;
  handleCreateQueue: () => Promise<void>;
  resetState: () => void;
}

export interface CreatedQueueInfo {
  queueNumber: number | null;
  queueType: QueueType;
  purpose: string;
}

export interface PatientInfo {
  patientId: string;
  patientName: string;
  patientPhone: string;
  lineId: string;
  newPatientName: string;
  finalPatientName: string;
  finalPatientPhone: string;
  finalPatientLineId: string;
}
