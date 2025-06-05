
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
}

export type QueueTypeEnum = 'GENERAL' | 'PRIORITY' | 'ELDERLY' | 'FOLLOW_UP';
export type QueueType = QueueTypeEnum; // Add explicit QueueType export
export type QueueStatus = 'WAITING' | 'ACTIVE' | 'COMPLETED' | 'SKIPPED' | 'CANCELLED' | 'ON_HOLD';

export interface Queue {
  id: string;
  number: number;
  patient_id: string;
  type: QueueTypeEnum;
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
}

export type AppointmentStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

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
