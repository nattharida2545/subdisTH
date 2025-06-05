
import { useFetchSettings } from './useFetchSettings';
import { useUpdateSettings } from './useUpdateSettings';
import { useSettingsSubscription } from './useSettingsSubscription';
import { SettingsState } from './types';

export const useSettings = (category: string = 'general') => {
  const { settings, loading, error, fetchSettings } = useFetchSettings(category);
  const { updateSetting, updateMultipleSettings, isUpdating } = useUpdateSettings();
  
  // Set up subscription to settings changes
  useSettingsSubscription(category, fetchSettings);

  return {
    settings,
    loading,
    error,
    isUpdating,
    updateSettings: (data: any, settingsCategory: string = category) => 
      updateSetting(data, settingsCategory),
    updateMultipleSettings: (data: any, settingsCategory: string = category) => 
      updateMultipleSettings(data, settingsCategory),
    fetchSettings
  };
};
