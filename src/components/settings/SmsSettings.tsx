
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/hooks/settings';
import { toast } from 'sonner';
import { SmsFormFields, SmsTestSection } from './sms';

interface SmsFormData {
  enabled: boolean;
  api_key: string;
  secret: string;
  sender_name: string;
  message_template: string;
  appointment_reminder_template: string;
  appointment_reminders_enabled: boolean;
}

const SmsSettings: React.FC = () => {
  const { settings, updateMultipleSettings, loading } = useSettings('sms');
  const [formData, setFormData] = useState<SmsFormData>({
    enabled: false,
    api_key: '',
    secret: '',
    sender_name: 'SubdisTH',
    message_template: 'ท่านกำลังจะได้รับบริการในคิวถัดไป คิวหมายเลข {queueNumber}',
    appointment_reminder_template: 'เตือนความจำ: คุณ {patientName} มีนัดหมาย {purpose} วันที่ {appointmentDate} เวลา {appointmentTime} น. กรุณามาตรงเวลาค่ะ',
    appointment_reminders_enabled: true
  });
  const [isSaving, setIsSaving] = useState(false);

  // Load settings when component mounts
  useEffect(() => {
    if (settings && Array.isArray(settings)) {
      const newFormData = { ...formData };
      settings.forEach((setting: any) => {
        if (setting.key === 'enabled' || setting.key === 'appointment_reminders_enabled') {
          (newFormData as any)[setting.key] = setting.value === 'true' || setting.value === true;
        } else if (setting.key in newFormData) {
          // Remove quotes from JSON string values
          const value = typeof setting.value === 'string' && setting.value.startsWith('"') 
            ? JSON.parse(setting.value) 
            : setting.value;
          (newFormData as any)[setting.key] = value;
        }
      });
      setFormData(newFormData);
      console.log('SMS Settings loaded:', newFormData);
    }
  }, [settings]);

  const handleInputChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updates = {
        enabled: formData.enabled.toString(),
        api_key: JSON.stringify(formData.api_key),
        secret: JSON.stringify(formData.secret),
        sender_name: JSON.stringify(formData.sender_name),
        message_template: JSON.stringify(formData.message_template),
        appointment_reminder_template: JSON.stringify(formData.appointment_reminder_template),
        appointment_reminders_enabled: formData.appointment_reminders_enabled.toString()
      };

      console.log('Saving SMS settings:', updates);
      await updateMultipleSettings(updates, 'sms');
      toast.success('บันทึกการตั้งค่า SMS เรียบร้อยแล้ว (รวมถึงการแจ้งเตือนนัดหมายอัตโนมัติ)');
    } catch (error) {
      console.error('Error saving SMS settings:', error);
      toast.error('เกิดข้อผิดพลาดในการบันทึกการตั้งค่า');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div>กำลังโหลดการตั้งค่า SMS...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>การตั้งค่า SMS</CardTitle>
          <p className="text-sm text-gray-600">
            ระบบจะส่ง SMS แจ้งเตือนนัดหมายอัตโนมัติ 2 ครั้งต่อวัน เวลา 11:00 น. และ 17:00 น.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <SmsFormFields 
            formData={formData}
            onInputChange={handleInputChange}
          />

          <SmsTestSection 
            enabled={formData.enabled}
            messageTemplate={formData.message_template}
          />

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmsSettings;
