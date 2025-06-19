
import { supabase } from '@/integrations/supabase/client';
import { createLogger } from '@/utils/logger';

const logger = createLogger('smsSettings');

export const checkSmsEnabled = async (): Promise<boolean> => {
  try {
    const { data: settings, error } = await supabase
      .from('settings')
      .select('value')
      .eq('category', 'sms')
      .eq('key', 'enabled')
      .single();

    if (error || !settings) {
      logger.warn('SMS enabled setting not found, defaulting to disabled');
      return false;
    }

    return settings.value === 'true' || settings.value === true;
  } catch (error) {
    logger.error('Error checking SMS enabled status:', error);
    return false;
  }
};

export const getMessageTemplate = async (): Promise<string | null> => {
  try {
    const { data: settings, error } = await supabase
      .from('settings')
      .select('value')
      .eq('category', 'sms')
      .eq('key', 'message_template')
      .single();

    if (error || !settings) {
      return null;
    }

    // Properly handle Json type conversion to string
    const value = settings.value;
    if (typeof value === 'string') {
      // If it's already a string, check if it's a JSON string that needs parsing
      if (value.startsWith('"') && value.endsWith('"')) {
        return JSON.parse(value);
      }
      return value;
    } else if (value) {
      // If it's not a string but has a value, convert to string
      return String(value);
    }
    
    return null;
  } catch (error) {
    logger.error('Error getting message template:', error);
    return null;
  }
};

export const getApiKey = async (): Promise<string | null> => {
  try {
    const { data: settings, error } = await supabase
      .from('settings')
      .select('value')
      .eq('category', 'sms')
      .eq('key', 'api_key')
      .single();

    if (error || !settings) {
      return null;
    }

    // Properly handle Json type conversion to string
    const value = settings.value;
    if (typeof value === 'string') {
      // If it's already a string, check if it's a JSON string that needs parsing
      if (value.startsWith('"') && value.endsWith('"')) {
        return JSON.parse(value);
      }
      return value;
    } else if (value) {
      // If it's not a string but has a value, convert to string
      return String(value);
    }
    
    return null;
  } catch (error) {
    logger.error('Error getting API key:', error);
    return null;
  }
};

export const getSecret = async (): Promise<string | null> => {
  try {
    const { data: settings, error } = await supabase
      .from('settings')
      .select('value')
      .eq('category', 'sms')
      .eq('key', 'secret')
      .single();

    if (error || !settings) {
      return null;
    }

    // Properly handle Json type conversion to string
    const value = settings.value;
    if (typeof value === 'string') {
      // If it's already a string, check if it's a JSON string that needs parsing
      if (value.startsWith('"') && value.endsWith('"')) {
        return JSON.parse(value);
      }
      return value;
    } else if (value) {
      // If it's not a string but has a value, convert to string
      return String(value);
    }
    
    return null;
  } catch (error) {
    logger.error('Error getting secret:', error);
    return null;
  }
};

export const getSenderName = async (): Promise<string | null> => {
  try {
    const { data: settings, error } = await supabase
      .from('settings')
      .select('value')
      .eq('category', 'sms')
      .eq('key', 'sender_name')
      .single();

    if (error || !settings) {
      return null;
    }

    // Properly handle Json type conversion to string
    const value = settings.value;
    if (typeof value === 'string') {
      // If it's already a string, check if it's a JSON string that needs parsing
      if (value.startsWith('"') && value.endsWith('"')) {
        return JSON.parse(value);
      }
      return value;
    } else if (value) {
      // If it's not a string but has a value, convert to string
      return String(value);
    }
    
    return null;
  } catch (error) {
    logger.error('Error getting sender name:', error);
    return null;
  }
};
