
import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { SettingsFormValues } from '@/contexts/SettingsContext';

interface UseSettingsSubmissionProps {
  form: UseFormReturn<SettingsFormValues>;
  updateMultipleSettings: (data: any, category?: string) => Promise<boolean>;
}

export const useSettingsSubmission = ({ form, updateMultipleSettings }: UseSettingsSubmissionProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: SettingsFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Save general settings to Supabase
      await updateMultipleSettings({
        hospital_name: data.hospital_name,
        hospital_address: data.hospital_address,
        pharmacy_name: data.pharmacy_name,
        pharmacy_phone: data.pharmacy_phone,
        pharmacy_email: data.pharmacy_email,
      }, 'general');
      
      // Save queue settings
      await updateMultipleSettings({
        queue_start_number: data.queue_start_number,
        queue_reset_daily: data.queue_reset_daily,
        queue_announcement_text: data.queue_announcement_text,
        queue_voice_enabled: data.queue_voice_enabled,
        queue_algorithm: data.queue_algorithm,
        enable_wait_time_prediction: data.enable_wait_time_prediction
      }, 'queue');
      
      // Save notification settings
      await updateMultipleSettings({
        line_notification_enabled: data.line_notification_enabled,
        sms_notification_enabled: data.sms_notification_enabled,
        appointment_notifications_enabled: data.appointment_notifications_enabled,
        voice_notifications_enabled: data.voice_notifications_enabled,
        notify_day_before: data.notify_day_before,
        notify_hours_before: data.notify_hours_before,
        notify_hour_before: data.notify_hour_before,
        notify_queue_position: data.notify_queue_position,
        notify_queue_waiting_time: data.notify_queue_waiting_time,
      }, 'notification');
      
      // Save queue algorithm to localStorage for use in other components
      localStorage.setItem('queue_algorithm', data.queue_algorithm);
      
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    setIsSubmitting,
    onSubmit
  };
};
