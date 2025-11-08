import * as React from "react";
import { toast } from "sonner";
import { Patient } from "@/integrations/supabase/schema";
import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/utils/logger";
import { PatientSearchState, PatientSearchActions, SearchType } from "./types";

const logger = createLogger("usePatientSearch");

export const usePatientSearch = (): PatientSearchState &
  PatientSearchActions => {
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [idCardNumber, setIdCardNumber] = React.useState("");
  const [searchType, setSearchType] = React.useState<SearchType>("phone");
  const [isSearching, setIsSearching] = React.useState(false);
  const [matchedPatients, setMatchedPatients] = React.useState<Patient[]>([]);
  const [showNewPatientForm, setShowNewPatientForm] = React.useState(false);

  const resetPatientSearch = React.useCallback(() => {
    logger.debug("Resetting patient search state");
    setPhoneNumber("");
    setIdCardNumber("");
    setIsSearching(false);
    setMatchedPatients([]);
    setShowNewPatientForm(false);
  }, []);

  const handleSearch = React.useCallback(async () => {
    const searchValue =
      searchType === "phone"
        ? phoneNumber
        : idCardNumber?.replace(/[\s-]/g, "");
    const searchField = searchType === "phone" ? "phone" : "ID_card";
    const errorMessage =
      searchType === "phone"
        ? "กรุณากรอกเบอร์โทรศัพท์"
        : "กรุณากรอกเลขบัตรประชาชน";

    logger.debug(`Starting ${searchType} search for: "${searchValue}"`);

    if (!searchValue) {
      logger.warn(`${searchType} is empty, showing error toast`);
      toast.error(errorMessage);
      return [];
    }

    setIsSearching(true);
    logger.debug("Setting isSearching to true");

    try {
      logger.debug(
        `Making Supabase request to search for patients by ${searchField}`
      );

      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .ilike(searchField, `%${searchValue}%`);

      if (error) {
        logger.error("Supabase error:", error);
        throw error;
      }

      const patients = data || [];
      logger.info(
        `Found ${patients.length} patients with ${searchField} containing "${searchValue}"`
      );
      setMatchedPatients(patients);

      if (patients.length === 0) {
        logger.debug("No patients found, showing new patient form");
        setShowNewPatientForm(true);
      } else {
        logger.debug("Patients found, hiding new patient form");
        setShowNewPatientForm(false);
      }

      return patients;
    } catch (err: any) {
      logger.error("Error searching for patients:", err);
      toast.error("ไม่สามารถค้นหาข้อมูลผู้ป่วยได้");
      return [];
    } finally {
      logger.debug("Search completed, setting isSearching to false");
      setIsSearching(false);
    }
  }, [phoneNumber, idCardNumber, searchType]);

  // Keep handlePhoneSearch for backward compatibility
  const handlePhoneSearch = handleSearch;

  return {
    phoneNumber,
    setPhoneNumber,
    idCardNumber,
    setIdCardNumber,
    searchType,
    setSearchType,
    isSearching,
    matchedPatients,
    showNewPatientForm,
    setShowNewPatientForm,
    handleSearch,
    handlePhoneSearch, // Keep for backward compatibility
    resetPatientSearch,
  };
};
