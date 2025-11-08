import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const ConnectPhone: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as any;

  useEffect(() => {
    // Check if we have LINE login data
    if (!state?.lineLoginSuccess) {
      navigate("/patient-portal");
    }
  }, [state, navigate]);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneNumber.trim()) {
      toast.error("กรุณากรอกเลขบัตรประชาชน");
      return;
    }

    if (!state?.lineUserId) {
      toast.error("ไม่พบข้อมูล LINE Account");
      return;
    }

    try {
      setLoading(true);

      // Find patient by phone number
      const { data: existingPatient, error: findError } = await supabase
        .from("patients")
        .select("*")
        .eq("ID_card", phoneNumber?.replace(/[\s-]/g, ""))
        .single();

      if (findError && findError.code !== "PGRST116") {
        throw findError;
      }

      if (existingPatient) {
        // Update existing patient with LINE information
        const { error: updateError } = await supabase
          .from("patients")
          .update({
            line_user_id: state.lineUserId,
            line_id: state.displayName,
            line_picture_url: state.pictureUrl,
            line_status_message: state.statusMessage,
          })
          .eq("id", existingPatient.id);

        if (updateError) throw updateError;

        // Store user data and navigate to patient portal
        localStorage.setItem("userPhone", phoneNumber?.replace(/[\s-]/g, ""));
        toast.success("เชื่อมต่อ LINE Account เรียบร้อยแล้ว");
        navigate("/patient-portal");
      } else {
        toast.error("ไม่พบข้อมูลผู้ป่วยของเลขบัตรประชาชนนี้");
      }
    } catch (error) {
      console.error("Error connecting phone:", error);
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // For now, just navigate back to patient portal
    navigate("/patient-portal");
  };

  if (!state?.lineLoginSuccess) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">เชื่อมต่อ LINE Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Display LINE profile */}
          <div className="flex flex-col items-center space-y-2 p-4 bg-green-50 rounded-lg">
            <Avatar className="w-16 h-16">
              <AvatarImage src={state.pictureUrl} alt={state.displayName} />
              <AvatarFallback>
                {state.displayName?.charAt(0) || "L"}
              </AvatarFallback>
            </Avatar>
            <h3 className="font-medium">{state.displayName}</h3>
            {state.statusMessage && (
              <p className="text-sm text-gray-600 text-center">
                {state.statusMessage}
              </p>
            )}
          </div>

          <form onSubmit={handleConnect} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="phone"
                className="text-sm font-medium text-gray-700"
              >
                กรอกเลขบัตรประจำตัวประชาชนที่ลงทะเบียนในระบบ
              </label>
              <Input
                id="phone"
                type="text"
                placeholder="เลขบัตรประจำตัวประชาชน"
                value={phoneNumber}
                onChange={(e) => {
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
                  setPhoneNumber(formatIdCard(e.target.value));
                }}
                maxLength={17}
                required
              />
              <p className="text-xs text-gray-500">
                เพื่อเชื่อมต่อบัญชี LINE ของคุณกับข้อมูลผู้ป่วยในระบบ
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleSkip}
              >
                ข้ามไปก่อน
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#06C755] hover:bg-[#06B048] text-white"
                disabled={loading}
              >
                {loading ? "กำลังเชื่อมต่อ..." : "เชื่อมต่อ"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConnectPhone;
