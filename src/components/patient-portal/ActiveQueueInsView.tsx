import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Users,
  Calendar,
  UserCog,
  LogOut,
  RotateCcw,
  Stethoscope,
} from "lucide-react";
import { Patient, QueueIns } from "@/integrations/supabase/schema";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { getTodayDate } from "@/utils/dateUtils";

interface ActiveQueueInsViewProps {
  patient: Patient;
  queueIns: QueueIns;
  patients: Patient[];
  onLogout: () => void;
  onSwitchPatient: () => void;
  onClearQueueHistory: () => void;
}

const ActiveQueueInsView: React.FC<ActiveQueueInsViewProps> = ({
  patient,
  queueIns,
  patients,
  onLogout,
  onSwitchPatient,
  onClearQueueHistory,
}) => {
  const navigate = useNavigate();
  const [insQueuePosition, setInsQueuePosition] = useState<number>(0);
  const [insEstimatedWaitTime, setInsEstimatedWaitTime] = useState<number>(0);
  const [loadingInsQueue, setLoadingInsQueue] = useState<boolean>(false);

  useEffect(() => {
    const calculateInsQueuePosition = async () => {
      try {
        setLoadingInsQueue(true);
        const today = getTodayDate();

        // Calculate INS queue position using queues_ins table
        let insPositionQuery = supabase
          .from("queues_ins")
          .select("*", { count: "exact" })
          .eq("queue_date", today)
          .eq("status", "WAITING")
          .is("paused_at", null)
          .lt("number", queueIns.number);

        if (queueIns.service_point_id) {
          insPositionQuery = insPositionQuery.or(
            `service_point_id.eq.${queueIns.service_point_id},service_point_id.is.null`
          );
        } else {
          insPositionQuery = insPositionQuery.is("service_point_id", null);
        }

        const { count: insCount, error: insCountError } =
          await insPositionQuery;

        if (insCountError) throw insCountError;

        setInsQueuePosition(insCount || 0);

        // Calculate estimated wait time for INS queue
        const { data: insAvgWaitTimeData } = await supabase
          .from("settings")
          .select("value")
          .eq("category", "queue")
          .eq("key", "ins_avg_wait_time")
          .single();

        const insAvgWaitTime = insAvgWaitTimeData
          ? parseInt(String(insAvgWaitTimeData.value), 10)
          : 15; // Default to 15 minutes for INS

        setInsEstimatedWaitTime(insCount * insAvgWaitTime);
      } catch (error) {
        console.error("Error calculating INS queue position:", error);
      } finally {
        setLoadingInsQueue(false);
      }
    };

    calculateInsQueuePosition();
  }, [queueIns]);

  // Debug output
  console.log("ActiveQueueInsView rendering with:", {
    queueIns,
    insQueuePosition,
    insEstimatedWaitTime,
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Patient Info Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {patient.name}
                </h2>
                <p className="text-gray-600">{patient.phone}</p>
              </div>
              <Badge
                variant="outline"
                className="bg-purple-50 text-purple-700 border-purple-200"
              >
                คิวที่ {queueIns.number}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* INS Queue Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-purple-600" />
              สถานะคิวตรวจ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {queueIns.status === "WAITING" && (
              <>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {insQueuePosition}
                  </div>
                  <p className="text-gray-600">คิวก่อนหน้า</p>
                </div>

                <div className="text-center">
                  <div className="text-xl font-semibold text-purple-600">
                    {insEstimatedWaitTime} นาที
                  </div>
                  <p className="text-gray-600">เวลารอโดยประมาณ</p>
                </div>
              </>
            )}

            {queueIns.paused_at && (
              <div className="text-center p-2 bg-yellow-50 rounded-md">
                <p className="text-orange-600 font-medium">
                  คิวของคุณถูกพักไว้
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  พักตั้งแต่:{" "}
                  {new Date(queueIns.paused_at).toLocaleTimeString("th-TH")}
                </p>
              </div>
            )}

            {queueIns.status === "ACTIVE" && (
              <div className="text-center p-2 bg-green-50 rounded-md">
                <p className="text-green-600 font-medium">กำลังตรวจ</p>
                <p className="text-sm text-gray-600 mt-1">
                  เริ่มตรวจเมื่อ:{" "}
                  {new Date(queueIns.called_at || "").toLocaleTimeString(
                    "th-TH"
                  )}
                </p>
              </div>
            )}

            {queueIns.status === "COMPLETED" && (
              <div className="text-center p-2 bg-blue-50 rounded-md">
                <p className="text-blue-600 font-medium">ตรวจเสร็จแล้ว</p>
                <p className="text-sm text-gray-600 mt-1">
                  เสร็จเมื่อ:{" "}
                  {new Date(queueIns.completed_at || "").toLocaleTimeString(
                    "th-TH"
                  )}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">การจัดการ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 gap-3">
              <Button
                onClick={() => navigate("/patient-portal/appointments")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Calendar className="w-4 h-4 mr-2" />
                ดูนัดหมาย
              </Button>
              <Button
                onClick={() => navigate("/patient-portal/profile")}
                variant="outline"
                className="w-full border-green-600 text-green-600 hover:bg-green-50"
              >
                <UserCog className="w-4 h-4 mr-2" />
                แก้ไขข้อมูลส่วนตัว
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Queue Management Actions */}
        <Card>
          <CardContent className="p-4 space-y-3">
            {patients.length > 1 && (
              <Button
                onClick={onSwitchPatient}
                variant="outline"
                className="w-full"
              >
                <Users className="w-4 h-4 mr-2" />
                เปลี่ยนผู้ป่วย
              </Button>
            )}

            <Button onClick={onLogout} variant="outline" className="w-full">
              <LogOut className="w-4 h-4 mr-2" />
              ออกจากระบบ
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ActiveQueueInsView;
