
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

interface SmsFormData {
  enabled: boolean;
  api_key: string;
  secret: string;
  sender_name: string;
  message_template: string;
  appointment_reminder_template: string;
  appointment_reminders_enabled: boolean;
}

interface SmsFormFieldsProps {
  formData: SmsFormData;
  onInputChange: (key: string, value: any) => void;
}

const SmsFormFields: React.FC<SmsFormFieldsProps> = ({ formData, onInputChange }) => {
  return (
    <>
      {/* Enable SMS */}
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="sms-enabled" className="text-base font-medium">
            เปิดใช้งาน SMS
          </Label>
          <p className="text-sm text-gray-500 mt-1">
            เปิด/ปิดการส่ง SMS แจ้งเตือนให้ผู้ป่วย
          </p>
        </div>
        <Switch
          id="sms-enabled"
          checked={formData.enabled}
          onCheckedChange={(checked) => onInputChange('enabled', checked)}
        />
      </div>

      {/* API Key */}
      <div>
        <Label htmlFor="api-key">API Key</Label>
        <Input
          id="api-key"
          type="password"
          value={formData.api_key}
          onChange={(e) => onInputChange('api_key', e.target.value)}
          placeholder="w9HyjAvAO54eaBywKvzRfOA18zkJaa"
        />
        <p className="text-sm text-gray-500 mt-2">
          ใส่ API Key ที่ได้จาก Thai Bulk SMS
        </p>
      </div>

      {/* Secret */}
      <div>
        <Label htmlFor="secret">Secret</Label>
        <Input
          id="secret"
          type="password"
          value={formData.secret}
          onChange={(e) => onInputChange('secret', e.target.value)}
          placeholder="JOLXUh5jOq4YmsEmAUCuFsGTZm9ber"
        />
        <p className="text-sm text-gray-500 mt-2">
          ใส่ Secret ที่ได้จาก Thai Bulk SMS
        </p>
      </div>

      {/* Sender Name */}
      <div>
        <Label htmlFor="sender-name">ชื่อผู้ส่ง</Label>
        <Input
          id="sender-name"
          value={formData.sender_name}
          onChange={(e) => onInputChange('sender_name', e.target.value)}
          placeholder="ชื่อที่จะแสดงเป็นผู้ส่ง SMS"
        />
      </div>

      {/* Queue Message Template */}
      <div>
        <Label htmlFor="message-template">รูปแบบข้อความแจ้งเตือนคิว</Label>
        <Textarea
          id="message-template"
          value={formData.message_template}
          onChange={(e) => onInputChange('message_template', e.target.value)}
          placeholder="รูปแบบข้อความที่จะส่ง"
          rows={3}
        />
        <p className="text-sm text-gray-500 mt-2">
          ใช้ {'{queueNumber}'} สำหรับหมายเลขคิว
        </p>
      </div>

      {/* Appointment Reminders Section */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Label htmlFor="appointment-reminders-enabled" className="text-base font-medium">
              เปิดใช้งาน SMS แจ้งเตือนนัดหมาย
            </Label>
            <p className="text-sm text-gray-500 mt-1">
              ส่ง SMS แจ้งเตือนนัดหมายวันถัดไป เวลา 11:00 และ 17:00 น.
            </p>
          </div>
          <Switch
            id="appointment-reminders-enabled"
            checked={formData.appointment_reminders_enabled}
            onCheckedChange={(checked) => onInputChange('appointment_reminders_enabled', checked)}
          />
        </div>

        {/* Appointment Reminder Template */}
        <div>
          <Label htmlFor="appointment-reminder-template">รูปแบบข้อความแจ้งเตือนนัดหมาย</Label>
          <Textarea
            id="appointment-reminder-template"
            value={formData.appointment_reminder_template}
            onChange={(e) => onInputChange('appointment_reminder_template', e.target.value)}
            placeholder="รูปแบบข้อความแจ้งเตือนนัดหมาย"
            rows={4}
          />
          <p className="text-sm text-gray-500 mt-2">
            ใช้ {'{patientName}'} สำหรับชื่อผู้ป่วย, {'{appointmentDate}'} สำหรับวันที่นัด, {'{appointmentTime}'} สำหรับเวลานัด, และ {'{purpose}'} สำหรับวัตถุประสงค์
          </p>
        </div>
      </div>
    </>
  );
};

export default SmsFormFields;
