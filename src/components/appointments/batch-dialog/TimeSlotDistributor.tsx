
import React, { useEffect, useState } from 'react';
import { format, parse } from 'date-fns';
import { th } from 'date-fns/locale';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Patient } from '@/integrations/supabase/schema';

interface TimeSlot {
  patientId: string;
  time: string;
}

interface TimeSlotDistributorProps {
  patients: Patient[];
  date: string;
  startTime: string;
  duration: number;
  onTimeSlotsChange: (slots: TimeSlot[]) => void;
}

export const TimeSlotDistributor: React.FC<TimeSlotDistributorProps> = ({
  patients,
  date,
  startTime,
  duration,
  onTimeSlotsChange
}) => {
  const [timeSlots, setTimeSlots] = useState<Array<{ patientId: string; time: string; formattedTime: string }>>([]);

  useEffect(() => {
    if (patients.length > 0 && date && startTime) {
      const slots = calculateTimeSlots();
      onTimeSlotsChange(slots);
    }
  }, [patients, date, startTime, duration]);

  const calculateTimeSlots = () => {
    try {
      // Parse the start time
      const timeFormat = 'HH:mm';
      let currentTime = parse(startTime, timeFormat, new Date());
      
      // Generate time slots for each patient
      const slots = patients.map((patient, index) => {
        if (index > 0) {
          // Add total duration (including 5 min buffer)
          currentTime = new Date(currentTime.getTime() + (duration + 5) * 60000);
        }
        
        const time = format(currentTime, timeFormat);
        const formattedTime = format(currentTime, 'HH:mm น.', { locale: th });
        
        return {
          patientId: patient.id,
          time,
          formattedTime
        };
      });
      
      setTimeSlots(slots);
      return slots.map(slot => ({ patientId: slot.patientId, time: slot.time }));
    } catch (error) {
      console.error('Error calculating time slots:', error);
      return [];
    }
  };

  if (patients.length === 0 || !date || !startTime) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">ตารางเวลาการนัด</h3>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">ลำดับ</TableHead>
              <TableHead>ชื่อผู้ป่วย</TableHead>
              <TableHead>เวลา</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {timeSlots.map((slot, index) => {
              const patient = patients.find(p => p.id === slot.patientId);
              return (
                <TableRow key={slot.patientId}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{patient?.name || 'ไม่พบชื่อ'}</TableCell>
                  <TableCell>{slot.formattedTime}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      
      <div className="text-xs text-gray-500">
        * เวลาการนัดถูกคำนวณโดยอัตโนมัติโดยใช้เวลา {duration} นาทีต่อผู้ป่วย 1 คน และมีเวลาพักระหว่างผู้ป่วย 5 นาที
      </div>
    </div>
  );
};
