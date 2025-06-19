
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { sendAppointmentReminders } from '@/utils/sms/appointmentReminder';

interface SmsTestSectionProps {
  enabled: boolean;
  messageTemplate: string;
}

const SmsTestSection: React.FC<SmsTestSectionProps> = ({ enabled, messageTemplate }) => {
  const [isTesting, setIsTesting] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [isTestingAppointments, setIsTestingAppointments] = useState(false);

  const handleTestSms = async () => {
    if (!testPhone.trim()) {
      toast.error('กรุณาใส่หมายเลขโทรศัพท์สำหรับทดสอบ');
      return;
    }

    setIsTesting(true);
    try {
      const testMessage = messageTemplate.replace('{queueNumber}', '999');

      const { data, error } = await supabase.functions.invoke('send-sms-notification', {
        body: {
          phoneNumber: testPhone,
          message: testMessage,
          queueNumber: '999',
          patientName: 'ผู้ป่วยทดสอบ'
        }
      });

      if (error) {
        throw error;
      }

      toast.success('ส่ง SMS ทดสอบเรียบร้อยแล้ว');
    } catch (error: any) {
      toast.error(`เกิดข้อผิดพลาดในการส่ง SMS: ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleTestAppointmentReminders = async () => {
    setIsTestingAppointments(true);
    try {
      const result = await sendAppointmentReminders();
      
      if (result.success) {
        toast.success(`${result.message} (ส่งแล้ว ${result.sent} ข้อความ)`);
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error(`เกิดข้อผิดพลาดในการส่ง SMS แจ้งเตือนนัดหมาย: ${error.message}`);
    } finally {
      setIsTestingAppointments(false);
    }
  };

  return (
    <div className="border-t pt-4 space-y-4">
      {/* Queue SMS Test */}
      <div>
        <Label htmlFor="test-phone">ทดสอบ SMS แจ้งเตือนคิว</Label>
        <div className="flex gap-2 mt-2">
          <Input
            id="test-phone"
            value={testPhone}
            onChange={(e) => setTestPhone(e.target.value)}
            placeholder="หมายเลขโทรศัพท์สำหรับทดสอบ เช่น 0644255591"
            className="flex-1"
          />
          <Button
            onClick={handleTestSms}
            disabled={isTesting || !enabled}
            variant="outline"
          >
            <Send className="w-4 h-4 mr-2" />
            {isTesting ? 'กำลังส่ง...' : 'ทดสอบ'}
          </Button>
        </div>
      </div>

      {/* Appointment Reminder Test */}
      <div>
        <Label>ทดสอบ SMS แจ้งเตือนนัดหมาย</Label>
        <div className="flex gap-2 mt-2">
          <Button
            onClick={handleTestAppointmentReminders}
            disabled={isTestingAppointments || !enabled}
            variant="outline"
            className="flex-1"
          >
            <Calendar className="w-4 h-4 mr-2" />
            {isTestingAppointments ? 'กำลังส่ง...' : 'ส่ง SMS แจ้งเตือนนัดหมายพรุ่งนี้'}
          </Button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          จะส่ง SMS แจ้งเตือนให้ผู้ป่วยทุกคนที่มีนัดหมายในวันพรุ่งนี้
        </p>
      </div>
    </div>
  );
};

export default SmsTestSection;
