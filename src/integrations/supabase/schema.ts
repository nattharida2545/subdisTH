export interface Patient {
  id: string;
  patient_id: string;
  name: string;
  phone: string;
  line_id?: string;
  line_user_id?: string;
  line_picture_url?: string;
  line_status_message?: string;
  address?: string;
  gender?: string;
  birth_date?: string;
  distance_from_hospital?: number;
  profile_image?: string;
  created_at: string;
  updated_at: string;
  ID_card?: string;
}

export type QueueTypeEnum = "GENERAL" | "URGENT" | "ELDERLY" | "APPOINTMENT";
export type QueueType = QueueTypeEnum; // Add explicit QueueType export
export type QueueStatus =
  | "WAITING"
  | "ACTIVE"
  | "COMPLETED"
  | "SKIPPED"
  | "CANCELLED"
  | "ON_HOLD";

export interface Queue {
  id: string;
  number: number;
  patient_id: string;
  type: string;
  status: QueueStatus;
  service_point_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  called_at?: string;
  completed_at?: string;
  skipped_at?: string;
  cancelled_at?: string;
  queue_date?: string;
  paused_at?: string;
  appointment_id?: string;
  transferred_at?: string;
  transferred_to_service_point_id?: string | null;
  noti_at?: string;
}

export type AppointmentStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED";

export interface Appointment {
  id: string;
  patient_id: string;
  date: string;
  purpose: string;
  notes?: string;
  status: AppointmentStatus;
  batch_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Medication {
  id: string;
  code: string;
  name: string;
  description?: string;
  unit: string;
  stock: number;
  min_stock: number;
  image?: string;
  created_at: string;
  updated_at: string;
}

export interface LineSettings {
  id: string;
  channel_id: number;
  channel_secret: string;
  access_token: number;
  welcome_message: string;
  queue_received_message: string;
  queue_called_message: string;
  tts_config: string;
  created_at: string;
  updated_at: string;
}

export interface Settings {
  id: string;
  category: string;
  key: string;
  value: string;
  created_at: string;
  updated_at: string;
}

export interface QueueTypeConfig {
  id: string;
  code: string;
  name: string;
  prefix: string;
  purpose: string;
  format: number;
  enabled: boolean;
  algorithm: string;
  priority: number;
  created_at: string;
  updated_at: string;
}

// New types for service points
export interface ServicePoint {
  id: string;
  code: string;
  name: string;
  location?: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServicePointQueueType {
  id: string;
  service_point_id: string;
  queue_type_id: string;
  created_at: string;
  updated_at: string;
}

// INS-specific types
export interface ServicePointIns {
  id: string;
  code: string;
  name: string;
  location?: string;
  enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface QueueIns {
  id: string;
  number: number;
  type: string;
  status: QueueStatus;
  service_point_id: string;
  // Dates & timestamps
  queue_date?: string;
  created_at?: string;
  updated_at?: string;
  called_at?: string;
  completed_at?: string;
  skipped_at?: string;
  cancelled_at?: string;
  paused_at?: string | null;
  transferred_at?: string;
  transferred_to_service_point_id?: string | null;
  noti_at?: string;
  // Patient contact/identity for INS
  phone_number?: string | null;
  ID_card?: string;
  // Additional patient information
  full_name?: string;
  house_number?: string | null;
  moo?: string | null;
}
