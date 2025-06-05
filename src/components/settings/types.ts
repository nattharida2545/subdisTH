
export interface LineService {
  sendNotification: (userId: string, message: string) => Promise<void>;
  getLINEProfile: (userId: string) => Promise<any>;
  generateLoginUrl: (state: string) => string;
  handleCallback: (code: string) => Promise<LineProfile>;
}

// LINE Auth Types
export interface LineState {
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  profile: LineProfile | null;
  error: string | null;
}

export interface LineProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}
