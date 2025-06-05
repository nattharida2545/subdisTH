
import { Appointment, AppointmentStatus } from '@/integrations/supabase/schema';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAppointmentActions = (
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>
) => {
  const addAppointment = async (appointmentData: Partial<Appointment>) => {
    try {
      if (!appointmentData.patient_id || !appointmentData.date || !appointmentData.purpose) {
        throw new Error('Missing required appointment data');
      }
      
      const { data, error } = await supabase
        .from('appointments')
        .insert([{
          patient_id: appointmentData.patient_id,
          date: appointmentData.date,
          purpose: appointmentData.purpose,
          notes: appointmentData.notes,
          status: appointmentData.status || 'SCHEDULED'
        }])
        .select();

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        const newAppointment: Appointment = {
          ...data[0],
          status: data[0].status as AppointmentStatus
        };
        
        setAppointments(prev => [...prev, newAppointment].sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        ));
        
        toast.success('เพิ่มการนัดหมายเรียบร้อยแล้ว');
        
        return newAppointment;
      }
      return null;
    } catch (err: any) {
      console.error('Error adding appointment:', err);
      toast.error('ไม่สามารถเพิ่มการนัดหมายได้');
      return null;
    }
  };

  const updateAppointment = async (id: string, appointmentData: Partial<Appointment>) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update({
          ...appointmentData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        const updatedAppointment: Appointment = {
          ...data[0],
          status: data[0].status as AppointmentStatus
        };
        
        setAppointments(prev => prev.map(appointment => 
          appointment.id === id ? updatedAppointment : appointment
        ));
        
        toast.success('อัปเดตการนัดหมายเรียบร้อยแล้ว');
        
        return updatedAppointment;
      }
      return null;
    } catch (err: any) {
      console.error('Error updating appointment:', err);
      toast.error('ไม่สามารถอัปเดตการนัดหมายได้');
      return null;
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setAppointments(prev => prev.filter(appointment => appointment.id !== id));
      
      toast.success('ลบการนัดหมายเรียบร้อยแล้ว');
      
      return true;
    } catch (err: any) {
      console.error('Error deleting appointment:', err);
      toast.error('ไม่สามารถลบการนัดหมายได้');
      return false;
    }
  };

  return {
    addAppointment,
    updateAppointment,
    deleteAppointment
  };
};
