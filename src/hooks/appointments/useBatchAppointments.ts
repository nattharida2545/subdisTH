
import { useState } from 'react';
import { Appointment, AppointmentStatus } from '@/integrations/supabase/schema';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BatchAppointmentData {
  date: string;
  patientSlots: Array<{
    patientId: string;
    time: string;
  }>;
  purpose: string;
  notes?: string;
}

export const useBatchAppointments = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const createBatchAppointments = async (data: BatchAppointmentData) => {
    const { date, patientSlots, purpose, notes } = data;
    
    try {
      setLoading(true);
      setProgress(0);
      
      const totalAppointments = patientSlots.length;
      const createdAppointments: Appointment[] = [];
      
      for (let i = 0; i < patientSlots.length; i++) {
        const { patientId, time } = patientSlots[i];
        
        // Combine date and time
        const appointmentDate = new Date(`${date}T${time}`);
        
        // Create the appointment
        const { data, error } = await supabase
          .from('appointments')
          .insert([{
            patient_id: patientId,
            date: appointmentDate.toISOString(),
            purpose,
            notes,
            status: 'SCHEDULED' as AppointmentStatus
          }])
          .select();
          
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          createdAppointments.push(data[0] as Appointment);
        }
        
        // Update progress
        setProgress(Math.floor(((i + 1) / totalAppointments) * 100));
      }
      
      toast({
        title: 'สำเร็จ',
        description: `สร้างนัดหมายสำหรับผู้ป่วย ${createdAppointments.length} รายเรียบร้อยแล้ว`,
      });
      
      return createdAppointments;
    } catch (err: any) {
      console.error('Error creating batch appointments:', err);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถสร้างนัดหมายได้ กรุณาลองใหม่อีกครั้ง',
        variant: 'destructive'
      });
      return null;
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };
  
  return {
    createBatchAppointments,
    loading,
    progress
  };
};
