
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
      // Save general settings to 'general' category
      await updateMultipleSettings({
        hospital_name: data.hospital_name,
        hospital_address: data.hospital_address,
        pharmacy_name: data.pharmacy_name,
        pharmacy_phone: data.pharmacy_phone,
        pharmacy_email: data.pharmacy_email,
      }, 'general');
      
      // Save queue settings to 'queue' category with proper format
      await updateMultipleSettings({
        queue_start_number: String(data.queue_start_number),
        queue_reset_daily: String(data.queue_reset_daily),
        queue_announcement_text: data.queue_announcement_text,
        queue_voice_enabled: String(data.queue_voice_enabled),
        queue_algorithm: data.queue_algorithm, // Save as string directly
        enable_wait_time_prediction: String(data.enable_wait_time_prediction)
      }, 'queue');
      
      // Save notification settings to 'notification' category
      await updateMultipleSettings({
        line_notification_enabled: String(data.line_notification_enabled),
        sms_notification_enabled: String(data.sms_notification_enabled),
        appointment_notifications_enabled: String(data.appointment_notifications_enabled),
        voice_notifications_enabled: String(data.voice_notifications_enabled),
        notify_day_before: String(data.notify_day_before),
        notify_hours_before: String(data.notify_hours_before),
        notify_hour_before: String(data.notify_hour_before),
        notify_queue_position: String(data.notify_queue_position),
        notify_queue_waiting_time: String(data.notify_queue_waiting_time),
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
