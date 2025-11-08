import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PlusCircle,
  UserPlus,
  Phone,
  CreditCard,
  Loader2,
  Search,
  CheckCircle,
  Printer,
} from "lucide-react";
import { createLogger } from "@/utils/logger";
import QueuePageHeader from "@/components/queue/QueuePageHeader";
import QueueBoardAlgorithmInfo from "@/components/queue/board/QueueBoardAlgorithmInfo";
import HospitalFooter from "@/components/queue/HospitalFooter";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { QueueType } from "@/integrations/supabase/schema";
import { useQueueTypesData } from "@/hooks/useQueueTypesData";
import { printQueueTicket } from "@/utils/printUtils";
import { getTodayDate } from "@/utils/dateUtils";
// QueueCreatedDialog removed as requested

const logger = createLogger("CreateQueue");

const CreateQueue: React.FC = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = React.useState(new Date());
  const [soundEnabled, setSoundEnabled] = React.useState(true);
  const { queueTypes, loading: queueTypesLoading } = useQueueTypesData();

  // Form state
  const [searchInput, setSearchInput] = React.useState("");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [idCardNumber, setIdCardNumber] = React.useState("");
  const [isSearching, setIsSearching] = React.useState(false);
  const [hasSearched, setHasSearched] = React.useState(false);
  const [matchedPatients, setMatchedPatients] = React.useState<any[]>([]);
  const [patientId, setPatientId] = React.useState("");

  // Patient edit state
  const [selectedPatientName, setSelectedPatientName] = React.useState("");
  const [selectedPatientPhone, setSelectedPatientPhone] = React.useState("");
  const [selectedPatientIdCard, setSelectedPatientIdCard] = React.useState("");
  const [isSavingPatient, setIsSavingPatient] = React.useState(false);

  // New patient form
  const [showNewPatientForm, setShowNewPatientForm] = React.useState(false);
  const [newPatientName, setNewPatientName] = React.useState("");

  // Queue details
  const [queueType, setQueueType] = React.useState<QueueType>("GENERAL");
  const [notes, setNotes] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  // Success state
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [createdQueueNumber, setCreatedQueueNumber] = React.useState<
    number | null
  >(null);
  const [createdQueueType, setCreatedQueueType] =
    React.useState<QueueType | null>(null);
  const [createdPurpose, setCreatedPurpose] = React.useState("");

  // Patient info for display
  const [finalPatientName, setFinalPatientName] = React.useState("");
  const [finalPatientPhone, setFinalPatientPhone] = React.useState("");
  const [finalPatientLineId, setFinalPatientLineId] = React.useState("");

  // Update the current time every second
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Set default queue type when queue types are loaded
  React.useEffect(() => {
    if (queueTypes && queueTypes.length > 0) {
      const enabledTypes = queueTypes
        .filter((qt) => qt.enabled && qt.purpose !== "INS")
        .find((val) => val.code === "GENERAL");
      if (enabledTypes) {
        setQueueType(enabledTypes.code as QueueType);
      }
    }
  }, [queueTypes]);

  // Format ID card number
  const formatIdCard = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 13) {
      return numbers.replace(
        /(\d{1})(\d{4})(\d{5})(\d{2})(\d{1})/,
        "$1-$2-$3-$4-$5"
      );
    }
    return value;
  };

  // Format phone number
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
    }
    return value;
  };

  // Handle input change
  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;

    if (field === "searchInput") {
      // Remove all non-digit characters for detection
      const digitsOnly = value.replace(/\D/g, "");

      // Detect if it's likely an ID card (13 digits) or phone number (10 digits)
      if (digitsOnly.length > 0) {
        if (digitsOnly.length <= 10) {
          // Format as phone number
          formattedValue = formatPhoneNumber(value);
        } else {
          // Format as ID card
          formattedValue = formatIdCard(value);
        }
      }

      setSearchInput(formattedValue);
    } else if (field === "idCardNumber") {
      formattedValue = formatIdCard(value);
      setIdCardNumber(formattedValue);
    } else if (field === "phoneNumber") {
      formattedValue = formatPhoneNumber(value);
      setPhoneNumber(formattedValue);
    } else if (field === "newPatientName") {
      setNewPatientName(value);
    } else if (field === "notes") {
      setNotes(value);
    }
  };

  // Reset search results
  const resetSearchResults = () => {
    setMatchedPatients([]);
  };

  // Handle patient search
  const handleSearch = async () => {
    // Check if search input is filled
    if (!searchInput) {
      toast.error("กรุณากรอกชื่อ เบอร์โทรศัพท์ หรือเลขบัตรประชาชน");
      return;
    }

    setIsSearching(true);
    setMatchedPatients([]);

    try {
      // Clean the input value (remove all non-digit characters for number detection)
      const cleanInput = searchInput.replace(/\D/g, "");

      // Determine if it's likely a phone number or ID card based on length
      const isPhoneNumber = cleanInput.length <= 10 && cleanInput.length > 0;
      const isIdCard = cleanInput.length === 13;
      const isName = cleanInput.length === 0 || (!isPhoneNumber && !isIdCard);

      // Store the values for later use in patient creation
      if (isPhoneNumber) {
        setPhoneNumber(searchInput);
        setIdCardNumber("");
      } else if (isIdCard) {
        setIdCardNumber(searchInput);
        setPhoneNumber("");
      }

      // Search for patients
      let results: any[] = [];

      // Search by phone if it looks like a phone number
      if (isPhoneNumber) {
        const { data: phoneData, error: phoneError } = await supabase
          .from("patients")
          .select("*")
          .eq("phone", cleanInput);

        if (phoneError) throw phoneError;
        if (phoneData && phoneData.length > 0) {
          results = [...results, ...phoneData];
        }
      }

      // Search by ID card if it looks like an ID card
      if (isIdCard) {
        const { data: idCardData, error: idCardError } = await supabase
          .from("patients")
          .select("*")
          .eq("ID_card", cleanInput);

        if (idCardError) throw idCardError;
        if (idCardData && idCardData.length > 0) {
          results = [...results, ...idCardData];
        }
      }

      // Search by name
      if (isName || (!isPhoneNumber && !isIdCard) || results.length === 0) {
        // If input doesn't look like a phone or ID card, or if no results found yet, search by name
        const { data: nameData, error: nameError } = await supabase
          .from("patients")
          .select("*")
          .ilike("name", `%${searchInput}%`)
          .order("name", { ascending: true });

        if (nameError) throw nameError;
        if (nameData && nameData.length > 0) {
          results = [...results, ...nameData];
        }
      }

      // If it's not clearly a name, phone or ID card, search all
      if (!isName && !isPhoneNumber && !isIdCard) {
        const { data: phoneData } = await supabase
          .from("patients")
          .select("*")
          .eq("phone", cleanInput);

        const { data: idCardData } = await supabase
          .from("patients")
          .select("*")
          .eq("ID_card", cleanInput);

        if (phoneData) results = [...results, ...phoneData];
        if (idCardData) results = [...results, ...idCardData];
      }

      // Deduplicate results
      const uniqueResults = results.filter(
        (item, index, self) => index === self.findIndex((t) => t.id === item.id)
      );

      if (uniqueResults.length > 0) {
        setMatchedPatients(uniqueResults);
      } else {
        setShowNewPatientForm(true);
        toast.info("ไม่พบข้อมูลผู้ป่วย กรุณาสร้างผู้ป่วยใหม่");
      }

      // Set hasSearched to true after search is complete
      setHasSearched(true);
    } catch (error) {
      console.error("Error searching for patient:", error);
      toast.error("เกิดข้อผิดพลาดในการค้นหาข้อมูลผู้ป่วย");
    } finally {
      setIsSearching(false);
    }
  };

  // Handle patient selection
  const handleSelectPatient = (id: string) => {
    setPatientId(id);
    const selectedPatient = matchedPatients.find((p) => p.id === id);
    if (selectedPatient) {
      // Set final values for queue creation
      setFinalPatientName(selectedPatient.name);
      setFinalPatientPhone(selectedPatient.phone || "");
      setFinalPatientLineId(selectedPatient.line_id || "");

      // Set values for patient information display and editing
      setSelectedPatientName(selectedPatient.name || "");
      setSelectedPatientPhone(selectedPatient.phone || "");
      setSelectedPatientIdCard(selectedPatient.ID_card || "");

      // Also update the ID card field for backward compatibility
      handleInputChange("idCardNumber", selectedPatient.ID_card || "");
    }
  };

  // Handle add new patient
  const handleAddNewPatient = async () => {
    if (!newPatientName) {
      toast.error("กรุณากรอกชื่อผู้ป่วย");
      return;
    }

    // Check if we have either a phone number or ID card
    const cleanInput = searchInput.replace(/\D/g, "");
    if (!cleanInput) {
      toast.error("กรุณากรอกเบอร์โทรศัพท์หรือเลขบัตรประชาชน");
      return;
    }

    try {
      // Need to include patient_id field for the patients table
      const patientId = `P${Date.now()}`; // Generate a unique patient ID

      // Determine if input is likely a phone number or ID card based on length
      const isPhoneNumber = cleanInput.length <= 10;
      const isIdCard = cleanInput.length === 13;

      // Create patient data object
      const patientData: any = {
        patient_id: patientId,
        name: newPatientName,
      };

      // Set phone or ID card based on detected type
      if (isPhoneNumber) {
        patientData.phone = cleanInput;
      } else if (isIdCard) {
        patientData.ID_card = cleanInput;
      } else {
        // If we can't determine, use the raw input as phone number
        patientData.phone = cleanInput;
      }

      const { data, error } = await supabase
        .from("patients")
        .insert(patientData)
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        setPatientId(data[0].id);
        setFinalPatientName(data[0].name);
        setFinalPatientPhone(data[0].phone || "");
        toast.success("สร้างผู้ป่วยใหม่สำเร็จ");
      }
    } catch (error) {
      console.error("Error creating new patient:", error);
      toast.error("เกิดข้อผิดพลาดในการสร้างผู้ป่วยใหม่");
    }
  };

  // Handle create queue
  const handleCreateQueue = async () => {
    if (!patientId && !newPatientName) {
      toast.error("กรุณาเลือกผู้ป่วยหรือสร้างผู้ป่วยใหม่");
      return;
    }

    setIsLoading(true);

    try {
      // If patient exists and information has been edited, update patient information first
      if (patientId && selectedPatientName) {
        try {
          // First, get the existing patient to retrieve the patient_id
          const { data: existingPatient, error: fetchError } = await supabase
            .from("patients")
            .select("patient_id")
            .eq("id", patientId)
            .single();

          if (fetchError) {
            console.error("Error fetching patient:", fetchError);
            // Continue with queue creation even if patient fetch fails
          } else if (existingPatient) {
            // Create update object for patient
            const updateData: any = {
              id: patientId,
              patient_id: existingPatient.patient_id, // Include the patient_id
              name: selectedPatientName,
            };

            // Only include phone and ID card if they have values
            if (selectedPatientPhone) {
              updateData.phone = selectedPatientPhone.replace(/\D/g, "");
            }

            if (selectedPatientIdCard) {
              updateData.ID_card = selectedPatientIdCard.replace(/\D/g, "");
            }

            // Update patient information using upsert
            const { error: updateError } = await supabase
              .from("patients")
              .upsert(updateData);

            if (updateError) {
              console.error("Error updating patient:", updateError);
              // Continue with queue creation even if patient update fails
            } else {
              console.log("Patient information updated successfully");
            }
          }
        } catch (error) {
          console.error("Error in patient update process:", error);
          // Continue with queue creation even if there's an error
        }
      }

      // Generate queue number
      const today = getTodayDate();
      const { data: lastQueue } = await supabase
        .from("queues")
        .select("number")
        .eq("queue_date", today)
        .order("number", { ascending: false })
        .limit(1);

      const queueNumber =
        lastQueue && lastQueue.length > 0 ? lastQueue[0].number + 1 : 1;

      // Get queue type purpose
      const selectedQueueType = queueTypes.find((qt) => qt.code === queueType);
      const purpose = selectedQueueType ? selectedQueueType.purpose : "";

      // Create queue
      const { data, error } = await supabase
        .from("queues")
        .insert([
          {
            number: queueNumber,
            patient_id: patientId,
            type: queueType,
            status: "WAITING",
            notes: notes,
            queue_date: today,
          },
        ])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        // Set the queue data first
        setCreatedQueueNumber(queueNumber);
        setCreatedQueueType(queueType);
        setCreatedPurpose(purpose);

        // Store patient information for the dialog
        if (patientId && selectedPatientName) {
          setFinalPatientName(selectedPatientName);
          setFinalPatientPhone(selectedPatientPhone);
          // Keep the line ID if it exists
        }

        // Set success state
        setIsSuccess(true);
        setHasSearched(false);

        // Show success message
        toast.success(`สร้างคิวสำเร็จ! หมายเลขคิวของคุณคือ ${queueNumber}`);

        // Don't reset the form here - it will clear the dialog data
        // resetForm() will be called after dialog is closed
      }
    } catch (error) {
      console.error("Error creating queue:", error);
      toast.error("เกิดข้อผิดพลาดในการสร้างคิว");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setSearchInput("");
    setPhoneNumber("");
    setIdCardNumber("");
    setMatchedPatients([]);
    setPatientId("");
    setShowNewPatientForm(false);
    setNewPatientName("");
    setNotes("");
    setIsSuccess(false);
    setCreatedQueueNumber(null);
    setCreatedQueueType(null);
    setCreatedPurpose("");
    setFinalPatientName("");
    setFinalPatientPhone("");
    setFinalPatientLineId("");
    setSelectedPatientName("");
    setSelectedPatientPhone("");
    setSelectedPatientIdCard("");
  };

  // Format queue number with prefix
  const getQueueTypePrefix = (typeCode: string, number: number) => {
    const queueType = queueTypes.find((qt) => qt.code === typeCode);
    return queueType
      ? queueType.prefix +
          number.toString().padStart(queueType.format?.length || 3, "0")
      : number.toString();
  };

  // Handle print button click
  const handlePrint = async () => {
    if (!createdQueueNumber || !createdQueueType) return;

    try {
      await printQueueTicket({
        queueNumber: createdQueueNumber,
        queueType: createdQueueType,
        patientName: finalPatientName,
        patientPhone: finalPatientPhone,
        patientLineId: finalPatientLineId,
        purpose: createdPurpose,
      });

      toast.success("กำลังพิมพ์บัตรคิว", { id: "print-ticket" });
    } catch (error) {
      console.error("Error printing ticket:", error);
      toast.error("เกิดข้อผิดพลาดในการพิมพ์บัตรคิว", {
        id: "print-ticket-error",
      });
    }
  };

  // Render success state with QR code dialog
  if (isSuccess && createdQueueNumber) {
    return (
      <div className="flex flex-col min-h-screen bg-pharmacy-50">
        {/* Header */}
        <QueuePageHeader
          currentTime={currentTime}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
          title="ระบบลงทะเบียนคิวห้องยา"
        />

        {/* Main Content Area */}
        <main className="flex-1 p-6 flex items-center justify-center">
          <Card className="w-full max-w-md shadow-2xl border-0">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  สร้างคิวสำเร็จ!
                </h2>
                <p className="text-gray-600">หมายเลขคิวของคุณคือ</p>
              </div>

              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl p-6 mb-6">
                <div className="text-6xl font-bold mb-2">
                  {createdQueueType && createdQueueNumber
                    ? getQueueTypePrefix(createdQueueType, createdQueueNumber)
                    : createdQueueNumber}
                </div>
                <div className="text-lg opacity-90">หมายเลขคิว</div>
              </div>

              <div className="space-y-3 mb-6 text-sm text-gray-600">
                <p>กรุณารอการเรียกคิวที่หน้าจอแสดงผล</p>
                <p>หรือติดตามสถานะคิวผ่านระบบ</p>
              </div>

              <div>
                <Button
                  onClick={handlePrint}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 mb-3"
                >
                  <Printer className="w-5 h-5" />
                  พิมพ์บัตรคิว
                </Button>

                <Button
                  onClick={resetForm}
                  variant="outline"
                  className="w-full border-2 border-blue-200 text-blue-600 hover:bg-blue-50 font-medium py-3 rounded-xl transition-all duration-200"
                >
                  สร้างคิวใหม่
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>

        {/* Footer */}
        <HospitalFooter />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-pharmacy-50">
      {/* Header */}
      <QueuePageHeader
        currentTime={currentTime}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        title="ระบบลงทะเบียนคิวห้องยา"
      />

      {/* Algorithm Info Bar */}
      <QueueBoardAlgorithmInfo algorithmName="ลงทะเบียนคิวห้องยา" />

      {/* Main Content Area */}
      <main className="flex-1 p-6 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              ลงทะเบียนคิวห้องยา
            </CardTitle>
            <p className="text-gray-600 mt-2">
              กรุณากรอกข้อมูลเพื่อรับหมายเลขคิว
            </p>
          </CardHeader>

          <CardContent className="px-6 pb-6">
            <form className="space-y-6">
              {/* ช่องค้นหา */}
              <div className="space-y-2">
                <Label
                  htmlFor="searchInput"
                  className="text-sm font-medium text-gray-700"
                >
                  ค้นหาด้วยชื่อ เบอร์โทรศัพท์ หรือเลขบัตรประชาชน
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="searchInput"
                    type="text"
                    placeholder="กรอกชื่อ เบอร์โทรศัพท์ หรือเลขบัตรประชาชน"
                    value={searchInput}
                    onChange={(e) =>
                      handleInputChange("searchInput", e.target.value)
                    }
                    className="h-12 rounded-xl border-2 transition-all duration-200 border-gray-200 focus:border-blue-500"
                    maxLength={50}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="px-3 h-12 rounded-xl"
                  >
                    {isSearching ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Search className="h-4 w-4 mr-2" />
                    )}
                    ค้นหา
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  สามารถค้นหาด้วยชื่อ เบอร์โทรศัพท์ หรือเลขบัตรประชาชนได้
                </p>
              </div>

              {/* แสดงผลการค้นหา */}
              {matchedPatients.length > 0 && (
                <div className="space-y-2 border rounded-lg p-3 bg-gray-50">
                  <Label className="text-sm font-medium text-gray-700">
                    ผลการค้นหา
                  </Label>
                  <div className="space-y-2">
                    {matchedPatients.map((patient) => (
                      <div
                        key={patient.id}
                        className={`p-3 border rounded-md ${
                          patientId === patient.id
                            ? "bg-blue-50 border-blue-300"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">{patient.name}</div>
                            <div className="text-sm text-gray-500">
                              เบอร์โทร: {patient.phone}
                            </div>
                            {patient.ID_card && (
                              <div className="text-sm text-gray-500">
                                เลขบัตรประชาชน: {patient.ID_card}
                              </div>
                            )}
                          </div>
                          <Button
                            type="button"
                            onClick={() => handleSelectPatient(patient.id)}
                            className={`px-4 py-2 ${
                              patientId === patient.id
                                ? "bg-blue-600 hover:bg-blue-700"
                                : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                            }`}
                            size="sm"
                          >
                            {patientId === patient.id ? "เลือกแล้ว" : "เลือก"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* แสดงข้อมูลผู้ป่วยที่เลือกและสามารถแก้ไขได้ */}
              {patientId && (
                <div className="space-y-4 rounded-lg ">
                  <div className="space-y-3">
                    <div>
                      <Label
                        htmlFor="selectedPatientName"
                        className="text-sm font-medium text-gray-700"
                      >
                        ชื่อผู้ป่วย
                      </Label>
                      <Input
                        id="selectedPatientName"
                        value={selectedPatientName}
                        onChange={(e) => setSelectedPatientName(e.target.value)}
                        className="mt-1 h-10"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="selectedPatientPhone"
                        className="text-sm font-medium text-gray-700"
                      >
                        เบอร์โทรศัพท์
                      </Label>
                      <Input
                        id="selectedPatientPhone"
                        value={selectedPatientPhone}
                        onChange={(e) =>
                          setSelectedPatientPhone(
                            formatPhoneNumber(e.target.value)
                          )
                        }
                        className="mt-1 h-10"
                        maxLength={12}
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="selectedPatientIdCard"
                        className="text-sm font-medium text-gray-700"
                      >
                        เลขบัตรประชาชน
                      </Label>
                      <Input
                        id="selectedPatientIdCard"
                        value={selectedPatientIdCard}
                        onChange={(e) =>
                          setSelectedPatientIdCard(formatIdCard(e.target.value))
                        }
                        className="mt-1 h-10"
                        maxLength={17}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* สร้างผู้ป่วยใหม่ */}
              {showNewPatientForm && (
                <div className="space-y-2">
                  <Label
                    htmlFor="newPatientName"
                    className="text-sm font-medium text-gray-700"
                  >
                    ชื่อผู้ป่วยใหม่
                  </Label>
                  <Input
                    id="newPatientName"
                    type="text"
                    placeholder="กรอกชื่อผู้ป่วย"
                    value={newPatientName}
                    onChange={(e) =>
                      handleInputChange("newPatientName", e.target.value)
                    }
                    className="h-12 rounded-xl border-2 transition-all duration-200 border-gray-200 focus:border-blue-500"
                  />
                  <Button
                    type="button"
                    onClick={handleAddNewPatient}
                    className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white"
                  >
                    สร้างผู้ป่วยใหม่
                  </Button>
                </div>
              )}

              {/* ประเภทคิว */}
              {(patientId || (showNewPatientForm && newPatientName)) && (
                <div className="space-y-2">
                  <Label
                    htmlFor="queueType"
                    className="text-sm font-medium text-gray-700"
                  >
                    ประเภทคิว
                  </Label>
                  <Select
                    value={queueType}
                    onValueChange={(value) => setQueueType(value as QueueType)}
                  >
                    <SelectTrigger
                      id="queueType"
                      className="h-12 rounded-xl border-2 transition-all duration-200 border-gray-200 focus:border-blue-500"
                    >
                      <SelectValue placeholder="เลือกประเภทคิว" />
                    </SelectTrigger>
                    <SelectContent>
                      {queueTypes &&
                        queueTypes
                          .filter((qt) => qt.enabled && qt.purpose !== "INS")
                          .map((qt) => (
                            <SelectItem key={qt.code} value={qt.code}>
                              {qt.name} - {qt.purpose || "ไม่มีคำอธิบาย"}
                            </SelectItem>
                          ))}
                      {(!queueTypes ||
                        queueTypes.filter(
                          (qt) => qt.enabled && qt.purpose !== "INS"
                        ).length === 0) && (
                        <SelectItem value="GENERAL" disabled>
                          ไม่มีประเภทคิวที่เปิดใช้งาน
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* บันทึกเพิ่มเติม */}
              {(patientId || (showNewPatientForm && newPatientName)) && (
                <div className="space-y-2">
                  <Label
                    htmlFor="notes"
                    className="text-sm font-medium text-gray-700"
                  >
                    บันทึกเพิ่มเติม
                  </Label>
                  <Input
                    id="notes"
                    type="text"
                    placeholder="บันทึกเพิ่มเติม (ถ้ามี)"
                    value={notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    className="h-12 rounded-xl border-2 transition-all duration-200 border-gray-200 focus:border-blue-500"
                  />
                </div>
              )}

              {/* ข้อมูลเพิ่มเติม */}
              <Alert className="border-blue-200 bg-blue-50">
                <AlertDescription className="text-blue-800 text-sm">
                  <strong>หมายเหตุ:</strong>{" "}
                  ข้อมูลที่กรอกจะใช้สำหรับการติดต่อและระบุตัวตนเท่านั้น
                </AlertDescription>
              </Alert>

              {/* ปุ่มสร้างคิว */}
              <Button
                type="button"
                onClick={handleCreateQueue}
                disabled={isLoading || (!patientId && !newPatientName)}
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    กำลังสร้างคิว...
                  </>
                ) : (
                  "รับหมายเลขคิว"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <HospitalFooter />
    </div>
  );
};

export default CreateQueue;
