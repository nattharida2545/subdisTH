
export interface LineSettings {
  channelId: string;
  channelSecret: string;
  accessToken: string;
  loginChannelId?: string;
  loginChannelSecret?: string;
  callbackUrl?: string;
  liffId?: string;
  welcomeMessage: string;
  queueReceivedMessage: string;
  queueCalledMessage: string;
}

export interface LineSettingsValidation {
  channelId: boolean;
  channelSecret: boolean;
  accessToken: boolean;
  loginChannelId: boolean;
  loginChannelSecret: boolean;
  isFormValid: boolean;
}

export interface LineSettingsErrors {
  channelId?: string;
  channelSecret?: string;
  accessToken?: string;
  loginChannelId?: string;
  loginChannelSecret?: string;
  callbackUrl?: string;
}

export interface TextToSpeechConfig {
  enabled: boolean;
  volume: number;
  rate: number;
  language: string;
}

export interface LineTestMessageResult {
  success: boolean;
  message: string;
}

// LINE Integration Types
export interface LineProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

export interface LineTokenResponse {
  access_token: string;
  expires_in: number;
  id_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
}

export interface LineState {
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  profile: LineProfile | null;
  error: string | null;
}

export interface LineLoginButtonProps {
  clientId: string;
  redirectUri: string;
  state?: string;
  scope?: string;
  prompt?: 'consent' | 'none';
  botPrompt?: 'normal' | 'aggressive';
  className?: string;
  children?: React.ReactNode;
}
