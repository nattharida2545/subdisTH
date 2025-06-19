
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Patient, Queue, QueueStatus, QueueTypeEnum } from '@/integrations/supabase/schema';

export const usePatientPortalState = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [activeQueue, setActiveQueue] = useState<Queue | null>(null);
  const [availableQueues, setAvailableQueues] = useState<Queue[]>([]);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [isStaffMode, setIsStaffMode] = useState<boolean>(false);

  const checkForActiveQueues = async (patientData: Patient[]) => {
    try {
      const patientIds = patientData.map(p => p.id);
      
      // Get today's date
      const today = new Date().toISOString().split('T')[0];
      
      const { data: queueData, error: queueError } = await supabase
        .from('queues')
        .select('*')
        .in('patient_id', patientIds)
        .in('status', ['WAITING', 'ACTIVE'])
        .eq('queue_date', today)
        .order('created_at', { ascending: false });
      
      if (queueError) throw queueError;
      
      if (queueData && queueData.length > 0) {
        console.log("[DEBUG] Found queues:", queueData.length);
        // Convert string type to QueueType and string status to QueueStatus
        const typedQueues: Queue[] = queueData.map(queue => ({
          ...queue,
          type: queue.type as QueueTypeEnum,
          status: queue.status as QueueStatus
        }));
        
        setAvailableQueues(typedQueues);
        
        // If there's only one queue, auto-select it
        if (typedQueues.length === 1) {
          const singleQueue = typedQueues[0];
          setActiveQueue(singleQueue);
          
          // Find which patient this queue belongs to
          const queuePatient = patientData.find(p => p.id === singleQueue.patient_id);
          if (queuePatient) {
            setSelectedPatient(queuePatient);
          } else {
            setSelectedPatient(patientData[0]);
          }
        }
        // If multiple queues, let user select (don't auto-select)
      } else {
        console.log("[DEBUG] No active queues found");
        // No active queues, select first patient for profile view
        setSelectedPatient(patientData[0]);
      }
    } catch (error) {
      console.error('Error checking for active queues:', error);
    }
  };

  const checkAuth = async () => {
    try {
      setLoading(true);
      
      // Check if there's a LINE auth token in localStorage
      const lineToken = localStorage.getItem('lineToken');
      const userPhone = localStorage.getItem('userPhone');
      
      if (lineToken && userPhone) {
        console.log("[DEBUG] Found LINE token and phone number, authenticating...");
        setIsAuthenticated(true);
        setPhoneNumber(userPhone);
        
        // Fetch patients associated with this phone number
        const { data: patientData, error: patientError } = await supabase
          .from('patients')
          .select('*')
          .eq('phone', userPhone);
        
        if (patientError) throw patientError;
        
        if (patientData && patientData.length > 0) {
          console.log("[DEBUG] Found patients:", patientData.length);
          setPatients(patientData);
          
          // Check if there are active queues for any of these patients
          await checkForActiveQueues(patientData);
        } else {
          console.log("[DEBUG] No patients found for phone:", userPhone);
          // No patients found for this phone number
          toast.info('ไม่พบข้อมูลผู้ป่วยที่เชื่อมโยงกับเบอร์โทรศัพท์นี้');
        }
      } else {
        console.log("[DEBUG] No LINE token or phone number found");
        // No LINE token or phone number found
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      toast.error('เกิดข้อผิดพลาดในการตรวจสอบการเข้าสู่ระบบ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return {
    isAuthenticated,
    loading,
    selectedPatient,
    patients,
    activeQueue,
    availableQueues,
    phoneNumber,
    isStaffMode,
    setIsAuthenticated,
    setSelectedPatient,
    setPatients,
    setActiveQueue,
    setAvailableQueues,
    setPhoneNumber,
    setIsStaffMode,
    checkForActiveQueues
  };
};
