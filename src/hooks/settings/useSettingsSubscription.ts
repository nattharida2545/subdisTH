
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSettingsSubscription = (
  category: string = 'general', 
  onSettingsChange: () => void
) => {
  useEffect(() => {
    // Set up real-time subscription for settings changes
    const channel = (supabase as any)
      .channel('settings-changes')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'settings', filter: `category=eq.${category}` },
          (payload: any) => {
            console.log('Settings data change detected:', payload);
            onSettingsChange(); // Refresh all settings when changes occur
          }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [category, onSettingsChange]);
};
