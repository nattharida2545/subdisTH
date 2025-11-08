import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { Patient } from "@/integrations/supabase/schema";
import { toast } from "sonner";

export const usePatientsSearch = () => {
  const [searchLoading, setSearchLoading] = React.useState(false);
  const [searchError, setSearchError] = React.useState<string | null>(null);

  // Search patients by name, patient_id, or phone
  const searchPatients = async (searchTerm: string) => {
    try {
      setSearchLoading(true);
      setSearchError(null);

      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .or(
          `name.ilike.%${searchTerm}%,patient_id.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,ID_card.ilike.%${searchTerm}%`
        )
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (err: any) {
      console.error("Error searching patients:", err);
      setSearchError(err.message || "Failed to search patients");
      toast.error("ไม่สามารถค้นหาข้อมูลผู้ป่วยได้");
      return [];
    } finally {
      setSearchLoading(false);
    }
  };

  // Find patient by exact phone number
  const findPatientByPhone = async (phoneNumber: string) => {
    try {
      setSearchLoading(true);
      setSearchError(null);

      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("phone", phoneNumber)
        .limit(1)
        .maybeSingle();

      if (error) {
        if (error.code === "PGRST116") {
          // No rows returned (PGRST116 is the "no rows" error code from PostgREST)
          return null;
        }
        throw error;
      }

      return data || null;
    } catch (err: any) {
      console.error("Error finding patient by phone:", err);
      setSearchError(err.message || "Failed to find patient");
      return null;
    } finally {
      setSearchLoading(false);
    }
  };

  return {
    searchLoading,
    searchError,
    searchPatients,
    findPatientByPhone,
  };
};
