import { Patient } from "@/integrations/supabase/schema";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const usePatientsActions = (
  patients: Patient[],
  setPatients: React.Dispatch<React.SetStateAction<Patient[]>>
) => {
  const actionError = null;

  const addPatient = async (
    patientData: Partial<Patient>
  ): Promise<Patient | null> => {
    try {
      if (!patientData.name || !patientData.ID_card) {
        throw new Error("Name and IDCard are required");
      }

      // Generate a patient_id with format P + 4 digits if not provided
      if (!patientData.patient_id) {
        const patientIdNum = Math.floor(1000 + Math.random() * 9000);
        patientData.patient_id = `P${patientIdNum}`;
      }

      const { data, error } = await supabase
        .from("patients")
        .insert({
          name: patientData.name,
          phone: patientData.phone,
          line_id: patientData.line_id || null,
          address: patientData.address || null,
          birth_date: patientData.birth_date || null,
          patient_id: patientData.patient_id,
          gender: patientData.gender || "ไม่ระบุ",
          ID_card: patientData.ID_card || null,
        })
        .select();

      if (error) {
        throw error;
      }

      // if (data && data.length > 0) {
      const newPatient = data[0] as Patient;

      setPatients((prev) => [...prev, newPatient]);

      toast.success("เพิ่มผู้ป่วยสำเร็จ");

      return newPatient;
      // }
      // return null;
    } catch (err: any) {
      console.error("Error adding patient:", err);
      toast.error("ไม่สามารถเพิ่มผู้ป่วยได้");
      return null;
    }
  };

  const updatePatient = async (
    id: string,
    patientData: Partial<Patient>
  ): Promise<Patient | null> => {
    try {
      if (!id) {
        throw new Error("Patient ID is required");
      }

      const { data, error } = await supabase
        .from("patients")
        .update({
          ...patientData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select();

      if (error) {
        throw error;
      }

      const updatedPatient = data[0] as Patient;

      setPatients((prev) =>
        prev.map((patient) => (patient.id === id ? updatedPatient : patient))
      );

      toast.success("อัปเดตข้อมูลผู้ป่วยสำเร็จ");

      return updatedPatient;
    } catch (err: any) {
      console.error("Error updating patient:", err);
      toast.error("ไม่สามารถอัปเดตข้อมูลผู้ป่วยได้");
      return null;
    }
  };

  const deletePatient = async (id: string): Promise<boolean> => {
    try {
      if (!id) {
        throw new Error("Patient ID is required");
      }

      const { error } = await supabase.from("patients").delete().eq("id", id);

      if (error) {
        throw error;
      }

      setPatients((prev) => prev.filter((patient) => patient.id !== id));

      toast.success("ลบข้อมูลผู้ป่วยสำเร็จ");

      return true;
    } catch (err: any) {
      console.error("Error deleting patient:", err);
      toast.error("ไม่สามารถลบข้อมูลผู้ป่วยได้");
      return false;
    }
  };

  return {
    actionError,
    addPatient,
    updatePatient,
    deletePatient,
  };
};
