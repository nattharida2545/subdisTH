
import axios from 'axios';
import { LineProfile } from '../components/settings/line/types';
import { supabase } from '@/integrations/supabase/client';

interface LineTokenResponse {
  access_token: string;
  expires_in: number;
  id_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
  profile?: {
    userId: string;
    displayName: string;
    pictureUrl?: string;
  };
}

interface LineSettingsFromDB {
  login_channel_id: string;
  login_channel_secret: string;
  callback_url: string;
  liff_id: string;
  channel_id: string;
  channel_secret: string;
  access_token: string;
}

class LineService {
  private lineSettings: LineSettingsFromDB | null = null;

  constructor() {
    this.loadSettings();
  }

  private async loadSettings(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('line_settings')
        .select('login_channel_id, login_channel_secret, callback_url, liff_id, channel_id, channel_secret, access_token')
        .single();

      if (error) {
        console.error('Error loading LINE settings:', error);
        return;
      }

      this.lineSettings = data;
      console.log('LINE settings loaded from database');
    } catch (error) {
      console.error('Failed to load LINE settings:', error);
    }
  }

  private async ensureSettings(): Promise<LineSettingsFromDB> {
    if (!this.lineSettings) {
      await this.loadSettings();
    }
    
    if (!this.lineSettings) {
      throw new Error('LINE settings not configured. Please configure LINE settings in the admin panel.');
    }
    
    return this.lineSettings;
  }

  async generateLoginUrl(state: string): Promise<string> {
    const settings = await this.ensureSettings();
    
    // Save state to localStorage for verification in callback
    localStorage.setItem('lineLoginState', state);
    
    const baseUrl = 'https://access.line.me/oauth2/v2.1/authorize';
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: settings.login_channel_id,
      redirect_uri: settings.callback_url,
      state,
      scope: 'profile openid email',
      bot_prompt: 'normal'
    });

    return `${baseUrl}?${params.toString()}`;
  }

  async exchangeToken(code: string): Promise<LineTokenResponse> {
    try {
      const settings = await this.ensureSettings();
      
      const response = await axios.post('/.netlify/functions/line-token-exchange', {
        code,
        redirectUri: settings.callback_url,
        clientId: settings.login_channel_id,
        clientSecret: settings.login_channel_secret
      });
      
      console.log("LINE token exchange complete. Response contains profile:", !!response.data.profile);
      
      return response.data;
    } catch (error) {
      console.error('Error exchanging LINE token:', error);
      throw new Error('Failed to exchange LINE token');
    }
  }

  async handleCallback(code: string): Promise<LineProfile> {
    try {
      const tokenResponse = await this.exchangeToken(code);
      
      // If profile is included in the token response
      if (tokenResponse.profile) {
        return {
          userId: tokenResponse.profile.userId,
          displayName: tokenResponse.profile.displayName,
          pictureUrl: tokenResponse.profile.pictureUrl
        };
      }
      
      // Otherwise fetch the profile separately
      const profile = await this.getProfile(tokenResponse.access_token);
      return profile;
    } catch (error) {
      console.error('Error handling LINE callback:', error);
      throw new Error('Failed to handle LINE callback');
    }
  }

  async getProfile(accessToken: string): Promise<LineProfile> {
    try {
      const response = await axios.get('/api/line-profile', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting LINE profile:', error);
      throw new Error('Failed to get LINE profile');
    }
  }

  // Get LINE user ID from localStorage
  getUserId(): string | null {
    return localStorage.getItem('lineUserId');
  }

  // Store LINE user ID to localStorage
  storeUserId(userId: string): void {
    localStorage.setItem('lineUserId', userId);
  }

  // Clear LINE authentication data
  clearAuth(): void {
    localStorage.removeItem('lineToken');
    localStorage.removeItem('lineUserId');
    localStorage.removeItem('lineProfile');
    localStorage.removeItem('lineLoginState');
  }

  // Method to send notifications (added for interface compliance)
  async sendNotification(userId: string, message: string): Promise<void> {
    try {
      await axios.post('/api/line-send-notification', {
        userId,
        message
      });
    } catch (error) {
      console.error('Error sending LINE notification:', error);
      throw new Error('Failed to send LINE notification');
    }
  }

  // Method to get LINE profile (added for interface compliance)
  async getLINEProfile(userId: string): Promise<any> {
    try {
      const response = await axios.post('/api/line-profile', {
        userId
      });
      return response.data;
    } catch (error) {
      console.error('Error getting LINE profile:', error);
      throw new Error('Failed to get LINE profile');
    }
  }
}

export const lineService = new LineService();
