
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { LogLevel, getLogLevel, setLogLevel } from '@/utils/logger';

const LoggingSettingsSection: React.FC = () => {
  const [logLevel, setLogLevelState] = useState<string>(getLogLevel().toString());

  // Load the current log level when the component mounts
  useEffect(() => {
    const storedLogLevel = localStorage.getItem('logLevel') || '2'; // Default to WARN
    setLogLevelState(storedLogLevel);
  }, []);

  const handleSaveLogLevel = () => {
    setLogLevel(Number(logLevel) as LogLevel);
    toast.success('การตั้งค่าการบันทึกถูกบันทึกแล้ว จะมีผลหลังจากรีโหลดหน้า');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>การบันทึกข้อมูล (Logging)</CardTitle>
        <CardDescription>
          ตั้งค่าระดับการบันทึกข้อมูลในคอนโซลสำหรับการพัฒนาและแก้ไขปัญหา
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="logLevel" className="col-span-1">
              ระดับการบันทึก
            </Label>
            <Select
              value={logLevel}
              onValueChange={setLogLevelState}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="เลือกระดับการบันทึก" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">ไม่บันทึก (NONE)</SelectItem>
                <SelectItem value="1">ข้อผิดพลาดเท่านั้น (ERROR)</SelectItem>
                <SelectItem value="2">คำเตือนและข้อผิดพลาด (WARN)</SelectItem>
                <SelectItem value="3">ข้อมูลทั่วไป (INFO)</SelectItem>
                <SelectItem value="4">ข้อมูลการแก้ไขปัญหา (DEBUG)</SelectItem>
                <SelectItem value="5">ข้อมูลอย่างละเอียด (VERBOSE)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={handleSaveLogLevel}>
              บันทึกและรีโหลด
            </Button>
          </div>
          
          <div className="mt-4 p-3 bg-gray-100 rounded-md text-sm">
            <h4 className="font-semibold mb-2">ระดับการบันทึกข้อมูล:</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li><span className="font-mono">NONE</span> - ไม่บันทึกข้อมูลใดๆ</li>
              <li><span className="font-mono">ERROR</span> - บันทึกเฉพาะข้อผิดพลาดร้ายแรง</li>
              <li><span className="font-mono">WARN</span> - บันทึกข้อมูลคำเตือนและข้อผิดพลาด</li>
              <li><span className="font-mono">INFO</span> - บันทึกข้อมูลสำคัญของแอปพลิเคชัน</li>
              <li><span className="font-mono">DEBUG</span> - บันทึกข้อมูลที่ใช้ในการแก้ไขปัญหา</li>
              <li><span className="font-mono">VERBOSE</span> - บันทึกข้อมูลทั้งหมดอย่างละเอียด</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoggingSettingsSection;
