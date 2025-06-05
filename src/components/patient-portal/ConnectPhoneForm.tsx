// src/components/patient-portal/ConnectPhoneForm.tsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Define a proper type for the update data
interface PatientLineUpdate {
  line_id?: string;
  line_user_id?: string;
  line_picture_url?: string;
  line_status_message?: string;
}

const ConnectPhoneForm: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Extract LINE user data from location state
  const lineUserId = location.state?.lineUserId;
  const displayName = location.state?.displayName;
  const pictureUrl = location.state?.pictureUrl;
  const statusMessage = location.state?.statusMessage;
  const email = location.state?.email; // Still extract it for display, but don't update DB

  useEffect(() => {
    // If no LINE user ID is provided, redirect back to patient portal
    if (!lineUserId) {
      toast.error("ไม่พบข้อมูลผู้ใช้ LINE");
      navigate("/patient-portal");
    }
  }, [lineUserId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneNumber.trim()) {
      toast.error("กรุณากรอกเบอร์โทรศัพท์");
      return;
    }

    try {
      setLoading(true);

      // Check if this phone number exists in the patients table
      const { data: patientData, error: patientError } = await supabase
        .from("patients")
        .select("*")
        .eq("phone", phoneNumber)
        .limit(1);

      if (patientError) {
        throw patientError;
      }

      if (patientData && patientData.length > 0) {
        // Patient exists, update the LINE ID
        const patient = patientData[0];

        // Create an object with only the fields we want to update
        const updateData: PatientLineUpdate = {
          line_id: displayName || '',    // Store display name in line_id
          line_user_id: lineUserId,      // Store system ID in line_user_id
          line_picture_url: pictureUrl,
          line_status_message: statusMessage
        };

        // Only add fields if they exist and have values
        if (lineUserId) updateData.line_user_id = lineUserId;
        if (pictureUrl) updateData.line_picture_url = pictureUrl;
        if (statusMessage) updateData.line_status_message = statusMessage;

        console.log("Updating patient with data:", updateData);

        const { error: updateError } = await supabase
          .from("patients")
          .update(updateData)
          .eq("id", patient.id);

        if (updateError) {
          console.error("Error updating patient:", updateError);
          throw updateError;
        }

        // Store the phone number and LINE ID in localStorage
        localStorage.setItem("userPhone", phoneNumber);
        localStorage.setItem("lineUserId", lineUserId);

        toast.success("เชื่อมต่อบัญชี LINE สำเร็จ");
        navigate("/patient-portal");
      } else {
        // No patient found with this phone number
        toast.error("ไม่พบข้อมูลผู้ป่วยที่ใช้เบอร์โทรศัพท์นี้");
      }
    } catch (error) {
      console.error("Error connecting phone number:", error);
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อเบอร์โทรศัพท์");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md p-6 bg-card rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">
          เชื่อมต่อบัญชี LINE
        </h1>

        {displayName && (
          <div className="mb-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              เข้าสู่ระบบด้วยบัญชี LINE
            </p>
            <p className="font-medium">{displayName}</p>
            {statusMessage && (
              <p className="text-sm text-muted-foreground mt-1 italic">"{statusMessage}"</p>
            )}
            {email && (
              <p className="text-sm text-muted-foreground mt-1">{email}</p>
            )}
            {pictureUrl && (
              <div className="mt-3 flex justify-center">
                <img
                  src={pictureUrl}
                  alt={displayName}
                  className="w-16 h-16 rounded-full"
                />
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium">
              กรุณากรอกเบอร์โทรศัพท์เพื่อเชื่อมต่อกับบัญชี LINE
            </label>
            <Input
              id="phone"
              type="tel"
              placeholder="0812345678"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              เบอร์โทรศัพท์นี้จะถูกใช้เพื่อเชื่อมต่อกับข้อมูลผู้ป่วยของคุณ
            </p>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#06C755] hover:bg-[#06B048] text-white"
            disabled={loading}
          >
            {loading ? "กำลังดำเนินการ..." : "เชื่อมต่อบัญชี"}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => navigate("/patient-portal")}
          >
            ยกเลิก
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ConnectPhoneForm;