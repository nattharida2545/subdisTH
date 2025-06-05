
import { QueueType, Patient } from '@/integrations/supabase/schema';

/**
 * Patient-related types for queue creation
 */
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

/**
 * Queue creation result object
 */
export interface QueueCreationResult {
  id: string;
  number: number;
  patient_id: string;
  type: QueueType;
  status: string;
  notes?: string;
  created_at: string;
}

/**
 * Props for hook interactions with the CreateQueueDialog
 */
export interface CreateQueueHookProps {
  onOpenChange: (open: boolean) => void;
  onCreateQueue: (queue: QueueCreationResult) => void;
}

/**
 * Queue hook return type
 */
export interface CreateQueueHookReturn {
  // Patient search
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  isSearching: boolean;
  matchedPatients: Patient[];
  handlePhoneSearch: () => Promise<Patient[]>;
  
  // Patient selection
  patientId: string;
  handleSelectPatient: (id: string) => void;
  
  // New patient
  showNewPatientForm: boolean;
  newPatientName: string;
  setNewPatientName: (value: string) => void;
  handleAddNewPatient: () => void;
  
  // Queue creation
  queueType: QueueType;
  setQueueType: (value: QueueType) => void;
  notes: string;
  setNotes: (value: string) => void;
  queueTypePurposes: Record<string, string>;
  
  // Queue dialog
  qrDialogOpen: boolean;
  setQrDialogOpen: (open: boolean) => void;
  createdQueueNumber: number | null;
  createdQueueType: QueueType | null;
  createdPurpose: string;
  
  // Final patient info
  finalPatientName: string;
  finalPatientPhone: string;
  finalPatientLineId: string;
  
  // Actions
  handleCreateQueue: () => Promise<QueueCreationResult | null>;
  resetState: () => void;
}
