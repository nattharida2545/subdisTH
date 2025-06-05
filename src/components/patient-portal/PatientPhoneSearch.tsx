
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { usePatients } from '@/hooks/usePatients';
import { Patient } from '@/integrations/supabase/schema';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

interface PatientPhoneSearchProps {
  onPatientFound: (patient: Patient) => void;
}

const PatientPhoneSearch: React.FC<PatientPhoneSearchProps> = ({ onPatientFound }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isOtpMode, setIsOtpMode] = useState(false);
  const { findPatientByPhone, searchLoading } = usePatients();

  const handleSearch = async () => {
    if (!phoneNumber.trim()) {
      toast.error('กรุณากรอกเบอร์โทรศัพท์');
      return;
    }
    
    try {
      const patient = await findPatientByPhone(phoneNumber);
      
      if (patient) {
        toast.success(`พบข้อมูลผู้ป่วย: ${patient.name}`);
        onPatientFound(patient);
      } else {
        toast.error('ไม่พบข้อมูลผู้ป่วยจากเบอร์โทรศัพท์นี้');
      }
    } catch (error) {
      console.error('Error searching for patient:', error);
      toast.error('เกิดข้อผิดพลาดในการค้นหาข้อมูลผู้ป่วย');
    }
  };

  const toggleInputMode = () => {
    setIsOtpMode(!isOtpMode);
  };

  const handleOtpComplete = (value: string) => {
    setPhoneNumber(value);
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h2 className="text-xl font-semibold">ค้นหาผู้ป่วยด้วยเบอร์โทรศัพท์</h2>
        <p className="text-gray-600 text-sm">สำหรับเจ้าหน้าที่ในการเข้าถึงข้อมูลผู้ป่วย</p>
      </div>

      {isOtpMode ? (
        <div className="space-y-4">
          <div className="flex justify-center">
            <InputOTP maxLength={10} value={phoneNumber} onChange={setPhoneNumber}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
                <InputOTPSlot index={6} />
                <InputOTPSlot index={7} />
                <InputOTPSlot index={8} />
                <InputOTPSlot index={9} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          <Button 
            type="button" 
            variant="link" 
            onClick={toggleInputMode}
            className="text-sm mx-auto block"
          >
            สลับไปใช้การกรอกแบบปกติ
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <Input
            type="tel"
            placeholder="กรอกเบอร์โทรศัพท์ผู้ป่วย (เช่น 0812345678)"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="text-center"
            maxLength={10}
          />
          <Button 
            type="button" 
            variant="link" 
            onClick={toggleInputMode}
            className="text-sm mx-auto block"
          >
            สลับไปใช้การกรอกแบบตัวเลข
          </Button>
        </div>
      )}

      <div className="flex justify-center">
        <Button 
          onClick={handleSearch} 
          className="w-full bg-pharmacy-600 hover:bg-pharmacy-700"
          disabled={phoneNumber.length < 10 || searchLoading}
        >
          {searchLoading ? 'กำลังค้นหา...' : 'ค้นหาผู้ป่วย'}
        </Button>
      </div>
    </div>
  );
};

export default PatientPhoneSearch;
