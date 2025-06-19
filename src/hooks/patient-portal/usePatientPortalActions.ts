
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Patient, Queue, QueueStatus, QueueTypeEnum } from '@/integrations/supabase/schema';

interface UsePatientPortalActionsProps {
  patients: Patient[];
  setSelectedPatient: (patient: Patient | null) => void;
  setActiveQueue: (queue: Queue | null) => void;
  setAvailableQueues: (queues: Queue[]) => void;
  setIsAuthenticated: (auth: boolean) => void;
  setIsStaffMode: (mode: boolean) => void;
  setPhoneNumber: (phone: string | null) => void;
  setPatients: (patients: Patient[]) => void;
  checkForActiveQueues: (patients: Patient[]) => Promise<void>;
}

export const usePatientPortalActions = ({
  patients,
  setSelectedPatient,
  setActiveQueue,
  setAvailableQueues,
  setIsAuthenticated,
  setIsStaffMode,
  setPhoneNumber,
  setPatients,
  checkForActiveQueues
}: UsePatientPortalActionsProps) => {
  
  const handlePatientSelect = async (patient: Patient) => {
    console.log("[DEBUG] Patient selected:", patient.name);
    setSelectedPatient(patient);
    
    // Check for active queues for this specific patient
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: queueData, error: queueError } = await supabase
        .from('queues')
        .select('*')
        .eq('patient_id', patient.id)
        .in('status', ['WAITING', 'ACTIVE'])
        .eq('queue_date', today)
        .order('created_at', { ascending: false });
      
      if (queueError) throw queueError;
      
      if (queueData && queueData.length > 0) {
        const typedQueues: Queue[] = queueData.map(queue => ({
          ...queue,
          type: queue.type as QueueTypeEnum,
          status: queue.status as QueueStatus
        }));
        
        setAvailableQueues(typedQueues);
        
        // If single queue, auto-select it and navigate to queue view
        if (typedQueues.length === 1) {
          setActiveQueue(typedQueues[0]);
        }
        // If multiple queues, user can see them in the selection view
      } else {
        // No active queues for this patient
        setAvailableQueues([]);
        setActiveQueue(null);
      }
    } catch (error) {
      console.error('Error fetching patient queues:', error);
      toast.error('เกิดข้อผิดพลาดในการดึงข้อมูลคิว');
    }
  };

  const handleLineLoginSuccess = async (token: string, userPhone: string) => {
    localStorage.setItem('lineToken', token);
    localStorage.setItem('userPhone', userPhone);
    setIsAuthenticated(true);
    setPhoneNumber(userPhone);
    setIsStaffMode(false);
    
    // Reload the page to fetch patient data
    window.location.reload();
  };

  const handlePatientFound = async (patient: Patient) => {
    setIsAuthenticated(true);
    setIsStaffMode(true);
    setSelectedPatient(patient);
    setPatients([patient]);
    
    // Check if there's an active queue for this patient
    try {
      // Add date filtering to only show recent queues (e.g., last 24 hours)
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      
      const { data: queueData, error: queueError } = await supabase
        .from('queues')
        .select('*')
        .eq('patient_id', patient.id)
        .in('status', ['WAITING', 'ACTIVE'])
        .gte('created_at', oneDayAgo.toISOString())
        .order('created_at', { ascending: false });
      
      if (queueError) throw queueError;
      
      if (queueData && queueData.length > 0) {
        // Convert string type to QueueType and string status to QueueStatus
        const typedQueues: Queue[] = queueData.map(queue => ({
          ...queue,
          type: queue.type as QueueTypeEnum,
          status: queue.status as QueueStatus
        }));
        
        setAvailableQueues(typedQueues);
        
        // If single queue, auto-select it
        if (typedQueues.length === 1) {
          setActiveQueue(typedQueues[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching patient queue:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('lineToken');
    localStorage.removeItem('userPhone');
    localStorage.removeItem('stepOutData');
    setIsAuthenticated(false);
    setSelectedPatient(null);
    setPatients([]);
    setActiveQueue(null);
    setAvailableQueues([]);
    setPhoneNumber(null);
    setIsStaffMode(false);
  };

  const handleSwitchPatient = () => {
    setActiveQueue(null);
    setAvailableQueues([]);
  };

  const handleSwitchQueue = () => {
    setActiveQueue(null);
  };

  const handleSelectQueue = (queue: Queue) => {
    setActiveQueue(queue);
    // Find which patient this queue belongs to
    const queuePatient = patients.find(p => p.id === queue.patient_id);
    if (queuePatient) {
      setSelectedPatient(queuePatient);
    }
  };

  const handleClearQueueHistory = async (selectedPatient: Patient | null) => {
    try {
      if (!selectedPatient) return;
      
      // Mark all WAITING or ACTIVE queues as COMPLETED for this patient
      const { error } = await supabase
        .from('queues')
        .update({ status: 'COMPLETED', completed_at: new Date().toISOString() })
        .in('status', ['WAITING', 'ACTIVE'])
        .eq('patient_id', selectedPatient.id);
      
      if (error) throw error;
      
      toast.success('ล้างประวัติคิวเก่าเรียบร้อยแล้ว');
      setActiveQueue(null);
      setAvailableQueues([]);
    } catch (error) {
      console.error('Error clearing queue history:', error);
      toast.error('เกิดข้อผิดพลาดในการล้างประวัติคิว');
    }
  };

  return {
    handlePatientSelect,
    handleLineLoginSuccess,
    handlePatientFound,
    handleLogout,
    handleSwitchPatient,
    handleSwitchQueue,
    handleSelectQueue,
    handleClearQueueHistory
  };
};
