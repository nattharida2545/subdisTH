
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useFetchSettings = (category: string = 'general') => {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use any to work around type system limitations
      const { data, error } = await (supabase as any)
        .from('settings')
        .select('key, value')
        .eq('category', category);

      if (error) {
        console.error(`Error fetching settings for ${category}:`, error);
        throw error;
      }

      // Return the array of key-value pairs directly so it's iterable
      if (data && data.length > 0) {
        console.log(`Fetched ${data.length} settings for category ${category}`);
        setSettings(data);
      } else {
        // If no data, set an empty array to avoid "not iterable" errors
        console.log(`No settings found for category ${category}, using empty array`);
        setSettings([]);
      }
      
      // Save to localStorage as a fallback for offline access
      localStorage.setItem(`settings_${category}`, JSON.stringify(data || []));
    } catch (err: any) {
      console.error(`Error fetching settings for ${category}:`, err);
      setError(err.message || `Failed to fetch ${category} settings`);
      
      // Try to load from localStorage if network request fails
      const savedSettings = localStorage.getItem(`settings_${category}`);
      if (savedSettings) {
        try {
          const parsedSettings = JSON.parse(savedSettings);
          setSettings(parsedSettings);
          toast.info('ใช้ข้อมูลการตั้งค่าที่บันทึกไว้ในเครื่อง');
        } catch (parseErr) {
          console.error('Error parsing saved settings:', parseErr);
          // Set empty array as fallback to avoid "not iterable" errors
          setSettings([]);
        }
      } else {
        console.warn(`No saved settings found for ${category}, using empty array`);
        setSettings([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchSettings();
  }, [category]);

  return {
    settings,
    loading,
    error,
    fetchSettings
  };
};
