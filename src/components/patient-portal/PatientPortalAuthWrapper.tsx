import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Patient } from "@/integrations/supabase/schema";
import PatientPortalLoading from "./PatientPortalLoading";
import { toast } from "sonner";

interface PatientPortalAuthWrapperProps {
  children: (
    patients: Patient[],
    selectedPatient: Patient | null,
    onSelectPatient: (patient: Patient) => void
  ) => React.ReactNode;
}

export const PatientPortalAuthWrapper: React.FC<
  PatientPortalAuthWrapperProps
> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("[PatientPortalAuthWrapper] Starting auth check...");

        const lineToken = localStorage.getItem("lineToken");
        const userPhone = localStorage.getItem("userPhone");

        console.log("[PatientPortalAuthWrapper] Auth tokens:", {
          hasLineToken: !!lineToken,
          userPhone: userPhone,
        });

        if (!lineToken || !userPhone) {
          console.log(
            "[PatientPortalAuthWrapper] Missing auth tokens, redirecting to login"
          );
          navigate("/patient-portal");
          return;
        }

        console.log(
          "[PatientPortalAuthWrapper] Fetching patient data for phone:",
          userPhone
        );

        // Fetch patient data - use regular query to handle multiple patients
        const { data: patientData, error } = await supabase
          .from("patients")
          .select("*")
          .eq("ID_card", userPhone);

        console.log("[PatientPortalAuthWrapper] Patient query result:", {
          data: patientData,
          error: error,
          count: patientData?.length || 0,
        });

        if (error) {
          console.error("[PatientPortalAuthWrapper] Database error:", error);
          toast.error("เกิดข้อผิดพลาดในการเข้าถึงข้อมูล กรุณาลองใหม่อีกครั้ง");
          localStorage.removeItem("lineToken");
          localStorage.removeItem("userPhone");
          navigate("/patient-portal");
          return;
        }

        if (!patientData || patientData.length === 0) {
          console.error(
            "[PatientPortalAuthWrapper] No patients found for phone:",
            userPhone
          );
          toast.error("ไม่พบข้อมูลผู้ป่วย กรุณาลองใหม่อีกครั้ง");
          localStorage.removeItem("lineToken");
          localStorage.removeItem("userPhone");
          navigate("/patient-portal");
          return;
        }

        console.log(
          "[PatientPortalAuthWrapper] Authentication successful, found patients:",
          patientData.length
        );
        setPatients(patientData);

        // Check if there's a previously selected patient
        const storedPatientId = localStorage.getItem("selectedPatientId");
        if (storedPatientId) {
          const storedPatient = patientData.find(
            (p) => p.id === storedPatientId
          );
          if (storedPatient) {
            setSelectedPatient(storedPatient);
            console.log(
              "[PatientPortalAuthWrapper] Restored selected patient:",
              storedPatient.name
            );
          }
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error("[PatientPortalAuthWrapper] Auth check error:", error);
        toast.error("เกิดข้อผิดพลาดในการตรวจสอบการเข้าสู่ระบบ");
        localStorage.removeItem("lineToken");
        localStorage.removeItem("userPhone");
        navigate("/patient-portal");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate, location.pathname]);

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    localStorage.setItem("selectedPatientId", patient.id);
    console.log("[PatientPortalAuthWrapper] Patient selected:", patient.name);
  };

  console.log("[PatientPortalAuthWrapper] Current state:", {
    loading,
    isAuthenticated,
    patientsCount: patients.length,
    selectedPatientName: selectedPatient?.name,
  });

  if (loading) {
    return <PatientPortalLoading />;
  }

  if (!isAuthenticated || patients.length === 0) {
    console.log(
      "[PatientPortalAuthWrapper] Not authenticated or no patients, showing null"
    );
    return null;
  }

  console.log(
    "[PatientPortalAuthWrapper] Rendering children with patients:",
    patients.length
  );
  return <>{children(patients, selectedPatient, handleSelectPatient)}</>;
};

export default PatientPortalAuthWrapper;
