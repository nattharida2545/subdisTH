
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LineSettings, TextToSpeechConfig } from '@/components/settings/line/types';
import { LineSettingsData } from '@/integrations/supabase/database.types';

export const useLineSettingsData = () => {
  const [lineSettings, setLineSettings] = useState<LineSettings | null>(null);
  const [ttsConfig, setTtsConfig] = useState<TextToSpeechConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLineSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all LINE settings including login credentials
      const { data, error } = await (supabase as any)
        .from('line_settings')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found is ok for initial setup
        throw error;
      }

      if (data) {
        const settings: LineSettings = {
          channelId: data.channel_id,
          channelSecret: data.channel_secret,
          accessToken: data.access_token,
          loginChannelId: data.login_channel_id,
          loginChannelSecret: data.login_channel_secret,
          callbackUrl: data.callback_url,
          liffId: data.liff_id,
          welcomeMessage: data.welcome_message,
          queueReceivedMessage: data.queue_received_message,
          queueCalledMessage: data.queue_called_message
        };
        
        setLineSettings(settings);
        setTtsConfig(data.tts_config as TextToSpeechConfig);
        
        // Save to localStorage as a fallback for offline access
        localStorage.setItem('lineSettings', JSON.stringify(settings));
        localStorage.setItem('ttsConfig', JSON.stringify(data.tts_config));
        
        console.log('Fetched LINE settings from database');
      } else {
        // If no settings found in DB, try to load from localStorage
        loadFromLocalStorage();
      }
    } catch (err: any) {
      console.error('Error fetching LINE settings:', err);
      setError(err.message || 'Failed to fetch LINE settings');
      
      // Try to load from localStorage if network request fails
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  const loadFromLocalStorage = () => {
    try {
      const savedLineSettings = localStorage.getItem('lineSettings');
      const savedTtsConfig = localStorage.getItem('ttsConfig');
      
      if (savedLineSettings) {
        setLineSettings(JSON.parse(savedLineSettings));
      }
      
      if (savedTtsConfig) {
        setTtsConfig(JSON.parse(savedTtsConfig));
      }
      
      if (savedLineSettings || savedTtsConfig) {
        toast.info('ใช้ข้อมูลการตั้งค่า LINE ที่บันทึกไว้ในเครื่อง');
      }
    } catch (err) {
      console.error('Error loading LINE settings from localStorage:', err);
    }
  };

  const saveLineSettings = async (settings: LineSettings, tts: TextToSpeechConfig) => {
    try {
      // First update local state for immediate UI update
      setLineSettings(settings);
      setTtsConfig(tts);
      
      // Save to localStorage as backup
      localStorage.setItem('lineSettings', JSON.stringify(settings));
      localStorage.setItem('ttsConfig', JSON.stringify(tts));

      // Then save to Supabase including all fields
      const { error } = await (supabase as any)
        .from('line_settings')
        .upsert({
          id: await getLineSettingsId(),
          channel_id: settings.channelId,
          channel_secret: settings.channelSecret,
          access_token: settings.accessToken,
          login_channel_id: settings.loginChannelId,
          login_channel_secret: settings.loginChannelSecret,
          callback_url: settings.callbackUrl,
          liff_id: settings.liffId,
          welcome_message: settings.welcomeMessage,
          queue_received_message: settings.queueReceivedMessage,
          queue_called_message: settings.queueCalledMessage,
          tts_config: tts
        });

      if (error) {
        throw error;
      }

      toast.success('บันทึกการตั้งค่า LINE Official Account เรียบร้อยแล้ว');
      return true;
    } catch (err: any) {
      console.error('Error saving LINE settings:', err);
      toast.error('ไม่สามารถบันทึกการตั้งค่า LINE ได้');
      return false;
    }
  };
  
  // Helper to get the ID of existing LINE settings, or null if none exists
  const getLineSettingsId = async (): Promise<string | null> => {
    try {
      const { data } = await (supabase as any)
        .from('line_settings')
        .select('id')
        .limit(1)
        .single();
      
      return data?.id || null;
    } catch {
      return null;
    }
  };

  // Initial data fetch and set up real-time subscription
  useEffect(() => {
    fetchLineSettings();
    
    // Set up real-time subscription for LINE settings changes
    const channel = (supabase as any)
      .channel('line-settings-changes')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'line_settings' },
          (payload: any) => {
            console.log('LINE settings data change detected:', payload);
            fetchLineSettings(); // Refresh settings when changes occur
          }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    lineSettings,
    ttsConfig,
    loading,
    error,
    fetchLineSettings,
    saveLineSettings
  };
};
