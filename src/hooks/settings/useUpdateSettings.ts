
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SettingsState, SettingItem, SettingUpdate } from './types';

export const useUpdateSettings = () => {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateSetting = async (data: SettingItem, category: string = 'queue') => {
    try {
      setIsUpdating(true);
      const { key, value } = data;
      
      console.log('Updating single setting:', { category, key, value, type: typeof value });
      
      // Prepare the value for JSONB storage - always store as string for simplicity
      const jsonbValue = typeof value === 'string' ? value : JSON.stringify(value);
      
      // Save to Supabase with proper JSONB string format
      const { error } = await supabase
        .from('settings')
        .upsert(
          { 
            category,
            key,
            value: jsonbValue
          },
          { 
            onConflict: 'category,key',
            ignoreDuplicates: false 
          }
        );

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      // Save to localStorage as backup
      const currentSettings = JSON.parse(localStorage.getItem(`settings_${category}`) || '[]');
      const updatedLocalSettings = [...currentSettings];
      const existingIndex = updatedLocalSettings.findIndex(item => item.key === key);
      
      if (existingIndex >= 0) {
        updatedLocalSettings[existingIndex] = { ...updatedLocalSettings[existingIndex], value };
      } else {
        updatedLocalSettings.push({ category, key, value });
      }
      
      localStorage.setItem(`settings_${category}`, JSON.stringify(updatedLocalSettings));

      return true;
    } catch (err: any) {
      console.error(`Error updating setting:`, err);
      toast.error(`ไม่สามารถบันทึกการตั้งค่าได้: ${err.message || 'Unknown error'}`);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const updateMultipleSettings = async (updates: SettingUpdate[] | SettingsState, category: string = 'queue') => {
    try {
      setIsUpdating(true);
      
      // Convert object format to array if needed
      const updatesArray = Array.isArray(updates) 
        ? updates 
        : Object.entries(updates).map(([key, value]) => ({
            category,
            key,
            value
          }));

      // Filter out any entries with null/undefined keys
      const validUpdates = updatesArray.filter(item => item.key && item.key.trim() !== '');

      if (validUpdates.length === 0) {
        console.warn('No valid updates to process');
        return true;
      }

      console.log('Updating multiple settings:', validUpdates);

      // Prepare updates for JSONB storage - store all values as strings
      const formattedUpdates = validUpdates.map((item: any) => ({
        category: item.category || category,
        key: item.key,
        value: typeof item.value === 'string' ? item.value : JSON.stringify(item.value)
      }));

      console.log('Formatted updates for database:', formattedUpdates);

      // Save to Supabase with proper JSONB string format
      const { error } = await supabase
        .from('settings')
        .upsert(
          formattedUpdates,
          { 
            onConflict: 'category,key',
            ignoreDuplicates: false 
          }
        );

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      // Save to localStorage as backup
      const currentLocalSettings = JSON.parse(localStorage.getItem(`settings_${category}`) || '[]');
      const updatedLocalSettings = Array.isArray(currentLocalSettings) ? [...currentLocalSettings] : [];
      
      for (const item of validUpdates) {
        const key = item.key;
        const value = item.value;
        const existingIndex = updatedLocalSettings.findIndex(setting => setting.key === key);
        
        if (existingIndex >= 0) {
          updatedLocalSettings[existingIndex] = { ...updatedLocalSettings[existingIndex], value };
        } else {
          updatedLocalSettings.push({
            category: item.category || category,
            key,
            value
          });
        }
      }
      
      localStorage.setItem(`settings_${category}`, JSON.stringify(updatedLocalSettings));

      toast.success('บันทึกการตั้งค่าเรียบร้อยแล้ว');
      return true;
    } catch (err: any) {
      console.error(`Error updating multiple settings:`, err);
      toast.error(`ไม่สามารถบันทึกการตั้งค่าได้: ${err.message || 'Unknown error'}`);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateSetting,
    updateMultipleSettings,
    isUpdating
  };
};
