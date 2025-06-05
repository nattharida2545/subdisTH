
export interface SettingsData {
  id: string;
  category: string;
  key: string;
  value: any;
  created_at: string;
  updated_at: string;
}

export interface QueueTypeData {
  id: string;
  code: string;
  name: string;
  prefix: string;
  purpose: string | null;
  format: string;
  enabled: boolean;
  algorithm: string;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface LineSettingsData {
  id: string;
  channel_id: string;
  channel_secret: string;
  access_token: string;
  welcome_message: string;
  queue_received_message: string;
  queue_called_message: string;
  tts_config: any;
  created_at: string;
  updated_at: string;
}

// Generic database response type
export interface SupabaseResponse<T> {
  data: T | null;
  error: Error | null;
}
