import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Patient,
  Queue,
  QueueIns,
  QueueStatus,
  QueueTypeEnum,
} from "@/integrations/supabase/schema";
import { getTodayDate } from "@/utils/dateUtils";

export const usePatientPortalState = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [activeQueue, setActiveQueue] = useState<Queue | null>(null);
  const [activeQueueIns, setActiveQueueIns] = useState<QueueIns | null>(null);
  const [availableQueues, setAvailableQueues] = useState<Queue[]>([]);
  const [availableQueuesIns, setAvailableQueuesIns] = useState<QueueIns[]>([]);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [isStaffMode, setIsStaffMode] = useState<boolean>(false);

  const checkForActiveQueues = async (patientData: Patient[]) => {
    try {
      const patientIds = patientData.map((p) => p.id);
      const idCards = patientData.map((p) => p.ID_card).filter(Boolean);

      // Get today's date
      const today = getTodayDate();

      // Get regular queues
      const { data: queueData, error: queueError } = await supabase
        .from("queues")
        .select("*")
        .in("patient_id", patientIds)
        .in("status", ["WAITING", "ACTIVE"])
        .eq("queue_date", today)
        .order("created_at", { ascending: false });

      // Get INS queues separately - match by ID card
      const { data: queueInsData, error: queueInsError } = await supabase
        .from("queues_ins")
        .select("*")
        .in("ID_card", idCards)
        .in("status", ["WAITING", "ACTIVE"])
        .eq("queue_date", today)
        .order("created_at", { ascending: false });

      if (queueError) throw queueError;
      if (queueInsError) throw queueInsError;

      console.log("queueInsData:", queueInsData);

      // Process regular queues
      if (queueData && queueData.length > 0) {
        console.log("[DEBUG] Found regular queues:", queueData.length);
        // Convert string type to QueueType and string status to QueueStatus
        const typedQueues: Queue[] = queueData.map((queue) => ({
          ...queue,
          type: queue.type as QueueTypeEnum,
          status: queue.status as QueueStatus,
        }));

        setAvailableQueues(typedQueues);

        // If there's only one queue, auto-select it
        if (typedQueues.length === 1) {
          const singleQueue = typedQueues[0];
          setActiveQueue(singleQueue);

          // Find which patient this queue belongs to
          const queuePatient = patientData.find(
            (p) => p.id === singleQueue.patient_id
          );
          if (queuePatient) {
            setSelectedPatient(queuePatient);
          } else {
            setSelectedPatient(patientData[0]);
          }
        }
      } else {
        console.log("[DEBUG] No active regular queues found");
      }

      // Process INS queues
      if (queueInsData && queueInsData.length > 0) {
        console.log("[DEBUG] Found INS queues:", queueInsData.length);
        // Convert status to QueueStatus
        const typedQueuesIns: QueueIns[] = queueInsData.map((queue) => ({
          ...queue,
          status: queue.status as QueueStatus,
        }));

        setAvailableQueuesIns(typedQueuesIns);

        // If there's only one INS queue, auto-select it
        if (typedQueuesIns.length === 1) {
          const singleQueueIns = typedQueuesIns[0];
          setActiveQueueIns(singleQueueIns);

          const queuePatient = patientData.find(
            (p) => p.ID_card === singleQueueIns.ID_card
          );
          if (queuePatient) {
            setSelectedPatient(queuePatient);
          } else {
            setSelectedPatient(patientData[0]);
          }
        }
      } else {
        console.log("[DEBUG] No active INS queues found");
      }

      // If no queues at all, just select the first patient
      if (
        (!queueData || queueData.length === 0) &&
        (!queueInsData || queueInsData.length === 0)
      ) {
        // No active queues, select first patient for profile view
        setSelectedPatient(patientData[0]);
      }
    } catch (error) {
      console.error("Error checking for active queues:", error);
    }
  };

  const checkAuth = async () => {
    try {
      setLoading(true);

      // Check if there's a LINE auth token in localStorage
      const lineToken = localStorage.getItem("lineToken");
      const userPhone = localStorage.getItem("userPhone");

      if (lineToken && userPhone) {
        console.log(
          "[DEBUG] Found LINE token and phone number, authenticating..."
        );
        setIsAuthenticated(true);
        setPhoneNumber(userPhone);

        // Fetch patients associated with this phone number
        const { data: patientData, error: patientError } = await supabase
          .from("patients")
          .select("*")
          .eq("ID_card", userPhone);

        if (patientError) throw patientError;

        if (patientData && patientData.length > 0) {
          console.log("[DEBUG] Found patients:", patientData.length);
          setPatients(patientData);

          // Check if there are active queues for any of these patients
          await checkForActiveQueues(patientData);
        } else {
          console.log("[DEBUG] No patients found for phone:", userPhone);
          // No patients found for this phone number
          toast.info(
            "ไม่พบข้อมูลผู้ป่วยที่เชื่อมโยงกับเลขบัตรประจำตัวประชาชนนี้"
          );
        }
      } else {
        console.log("[DEBUG] No LINE token or phone number found");
        // No LINE token or phone number found
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Error checking authentication:", error);
      toast.error("เกิดข้อผิดพลาดในการตรวจสอบการเข้าสู่ระบบ");
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
    activeQueueIns,
    availableQueues,
    availableQueuesIns,
    phoneNumber,
    isStaffMode,
    setIsAuthenticated,
    setSelectedPatient,
    setPatients,
    setActiveQueue,
    setActiveQueueIns,
    setAvailableQueues,
    setAvailableQueuesIns,
    setPhoneNumber,
    setIsStaffMode,
    checkForActiveQueues,
  };
};
