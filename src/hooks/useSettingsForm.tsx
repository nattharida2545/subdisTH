
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { queueSettingsSchema, initialQueueTypes } from '@/components/settings/schemas';
import { useSettings } from '@/hooks/settings';
import { QueueAlgorithmType } from '@/utils/queueAlgorithms';
import { useQueueTypesData } from './useQueueTypesData';
import { QueueType, ensureValidFormat, ensureValidAlgorithm } from './useQueueTypes';
import { SettingsFormValues } from '@/contexts/SettingsContext';

const defaultValues: SettingsFormValues = {
  hospital_name: 'โรงพยาบาลส่งเสริมสุขภาพตำบลหนองแวง',
  hospital_address: 'หมู่ 7 ตำบลหนองแวง อำเภอกุดรัง จังหวัดมหาสารคาม 44130',
  hospital_phone: '',
  hospital_website: '',
  pharmacy_name: 'ห้องยาโรงพยาบาลส่งเสริมสุขภาพตำบลหนองแวง',
  pharmacy_phone: '',
  pharmacy_email: '',
  queue_types: initialQueueTypes,
  queue_reset_daily: true,
  queue_start_number: 1,
  queue_algorithm: QueueAlgorithmType.FIFO,
  enable_wait_time_prediction: true,
  queue_announcement_enabled: true,
  queue_announcement_text: 'ขอเชิญหมายเลข {queueNumber} ที่ช่องบริการ {counter}',
  queue_voice_enabled: true,
  queue_voice_speed: 0.8,
  queue_voice_pitch: 1,
  line_notification_enabled: true,
  sms_notification_enabled: false,
  appointment_notifications_enabled: true,
  voice_notifications_enabled: true,
  notify_day_before: true,
  notify_hours_before: true,
  notify_hour_before: false,
  notify_queue_position: true,
  notify_queue_waiting_time: true,
};

export const useSettingsForm = () => {
  const [loading, setLoading] = useState(true);
  const [queueTypesInitialized, setQueueTypesInitialized] = useState(false);
  
  // Initialize all settings hooks at the component level
  const generalSettingsHook = useSettings('general');
  const queueSettingsHook = useSettings('queue');
  const notificationSettingsHook = useSettings('notification');
  
  const { queueTypes, loading: loadingQueueTypes } = useQueueTypesData();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(queueSettingsSchema),
    defaultValues,
  });

  useEffect(() => {
    // Load settings from multiple categories
    const { settings: generalSettings } = generalSettingsHook;
    const { settings: queueSettings } = queueSettingsHook;
    const { settings: notificationSettings } = notificationSettingsHook;

    if (generalSettings || queueSettings || notificationSettings) {
      console.log('Loading settings:', { generalSettings, queueSettings, notificationSettings });
      
      let mergedValues = { ...defaultValues };
      
      // Process general settings
      if (Array.isArray(generalSettings)) {
        for (const setting of generalSettings) {
          try {
            if (setting.key in defaultValues) {
              mergedValues = {
                ...mergedValues,
                [setting.key]: setting.value,
              };
            }
          } catch (error) {
            console.error(`Error processing general setting ${setting.key}:`, error);
          }
        }
      }
      
      // Process queue settings (including queue_algorithm)
      if (Array.isArray(queueSettings)) {
        for (const setting of queueSettings) {
          try {
            if (setting.key === 'queue_algorithm') {
              const algorithm = setting.value as unknown as string;
              console.log('Loading queue algorithm from queue settings:', algorithm);
              if (algorithm && Object.values(QueueAlgorithmType).includes(algorithm as QueueAlgorithmType)) {
                mergedValues.queue_algorithm = algorithm as QueueAlgorithmType;
                console.log('Set queue algorithm to:', algorithm);
              }
            } else if (setting.key in defaultValues) {
              // Handle other queue settings like queue_start_number, queue_reset_daily, etc.
              let value = setting.value;
              
              // Convert string values to appropriate types
              if (setting.key === 'queue_start_number') {
                value = parseInt(value as string) || 1;
              } else if (setting.key === 'queue_reset_daily' || setting.key === 'enable_wait_time_prediction' || setting.key === 'queue_voice_enabled') {
                value = value === 'true' || value === true;
              }
              
              mergedValues = {
                ...mergedValues,
                [setting.key]: value,
              };
            }
          } catch (error) {
            console.error(`Error processing queue setting ${setting.key}:`, error);
          }
        }
      }
      
      // Process notification settings
      if (Array.isArray(notificationSettings)) {
        for (const setting of notificationSettings) {
          try {
            if (setting.key in defaultValues) {
              // Convert string values to boolean for notification settings
              let value = setting.value;
              if (typeof value === 'string') {
                value = value === 'true';
              }
              
              mergedValues = {
                ...mergedValues,
                [setting.key]: value,
              };
            }
          } catch (error) {
            console.error(`Error processing notification setting ${setting.key}:`, error);
          }
        }
      }
      
      console.log('Final merged values:', mergedValues);
      form.reset(mergedValues);
      setLoading(false);
    }
  }, [generalSettingsHook.settings, queueSettingsHook.settings, notificationSettingsHook.settings, form]);
  
  useEffect(() => {
    if (!loadingQueueTypes && queueTypes && queueTypes.length > 0) {
      const convertedQueueTypes = queueTypes.map(qt => ({
        id: qt.id,
        code: qt.code,
        name: qt.name,
        prefix: qt.prefix,
        purpose: qt.purpose,
        format: ensureValidFormat(qt.format), 
        enabled: qt.enabled,
        algorithm: ensureValidAlgorithm(qt.algorithm) as QueueAlgorithmType,
        priority: typeof qt.priority === 'number' ? qt.priority : 5
      }));
      
      form.setValue('queue_types', convertedQueueTypes);
      setQueueTypesInitialized(true);
    }
  }, [loadingQueueTypes, queueTypes, form]);

  const updateMultipleSettings = async (data: any, category: string = 'queue') => {
    try {
      console.log('updateMultipleSettings called with:', { data, category });
      
      const settingsArray = Object.entries(data).map(([key, value]) => ({
        category,
        key,
        value,
      }));
      
      console.log('Converted to settings array:', settingsArray);
      
      // Use the appropriate settings hook based on category
      let success = false;
      if (category === 'general') {
        success = await generalSettingsHook.updateMultipleSettings(settingsArray, category);
      } else if (category === 'notification') {
        success = await notificationSettingsHook.updateMultipleSettings(settingsArray, category);
      } else {
        success = await queueSettingsHook.updateMultipleSettings(settingsArray, category);
      }
      
      return success;
    } catch (error) {
      console.error('Error updating settings:', error);
      return false;
    }
  };

  return {
    form,
    settings: {
      form,
    },
    loading,
    loadingQueueTypes,
    updateMultipleSettings,
    initialized: queueTypesInitialized,
  };
};
