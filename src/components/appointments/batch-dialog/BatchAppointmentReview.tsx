
import React from 'react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TimeSlot } from './types';
import { Patient } from '@/integrations/supabase/schema';
import { Progress } from '@/components/ui/progress';

interface BatchAppointmentReviewProps {
  patients: Patient[];
  date: string;
  timeSlots: TimeSlot[];
  purpose: string;
  notes?: string;
  isProcessing: boolean;
  progress: number;
}

export const BatchAppointmentReview: React.FC<BatchAppointmentReviewProps> = ({
  patients,
  date,
  timeSlots,
  purpose,
  notes,
  isProcessing,
  progress
}) => {
  const formattedDate = date ? format(new Date(date), 'dd MMMM yyyy', { locale: th }) : '';
  
  // Get time range
  const getTimeRange = () => {
    if (timeSlots.length === 0) return '';
    
    const firstTime = timeSlots[0]?.time || '';
    const lastTime = timeSlots[timeSlots.length - 1]?.time || '';
    
    return `${firstTime} - ${lastTime}`;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>สรุปข้อมูลการนัดหมาย</CardTitle>
          <CardDescription>ตรวจสอบข้อมูลการนัดหมายก่อนยืนยัน</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-semibold">วันที่</div>
              <div>{formattedDate}</div>
            </div>
            <div>
              <div className="text-sm font-semibold">ช่วงเวลา</div>
              <div>{getTimeRange()}</div>
            </div>
            <div>
              <div className="text-sm font-semibold">จุดประสงค์</div>
              <div>{purpose}</div>
            </div>
            <div>
              <div className="text-sm font-semibold">จำนวนผู้ป่วย</div>
              <div>{patients.length} คน</div>
            </div>
          </div>
          
          {notes && (
            <div>
              <div className="text-sm font-semibold">หมายเหตุ</div>
              <div className="text-sm">{notes}</div>
            </div>
          )}
          
          <div>
            <div className="text-sm font-semibold mb-2">รายชื่อผู้ป่วย</div>
            <div className="border rounded-md divide-y max-h-60 overflow-y-auto">
              {patients.map((patient, index) => {
                const timeSlot = timeSlots.find(slot => slot.patientId === patient.id);
                return (
                  <div key={patient.id} className="p-2 flex justify-between">
                    <div>
                      {index + 1}. {patient.name}
                    </div>
                    <div className="text-gray-500">
                      {timeSlot?.time || '-'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {isProcessing && (
            <div className="space-y-1">
              <div className="text-sm flex justify-between">
                <span>กำลังสร้างนัดหมาย...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
