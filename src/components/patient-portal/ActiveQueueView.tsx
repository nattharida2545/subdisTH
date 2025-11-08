import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Users,
  ArrowRight,
  Calendar,
  UserCog,
  LogOut,
  RotateCcw,
} from "lucide-react";
import { Patient, Queue } from "@/integrations/supabase/schema";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { getTodayDate } from "@/utils/dateUtils";

interface ActiveQueueViewProps {
  patient: Patient;
  queue: Queue;
  patients: Patient[];
  availableQueues: Queue[];
  onLogout: () => void;
  onSwitchPatient: () => void;
  onSwitchQueue?: () => void;
  onClearQueueHistory: () => void;
}

const ActiveQueueView: React.FC<ActiveQueueViewProps> = ({
  patient,
  queue,
  patients,
  availableQueues,
  onLogout,
  onSwitchPatient,
  onSwitchQueue,
  onClearQueueHistory,
}) => {
  const navigate = useNavigate();
  const [queuePosition, setQueuePosition] = useState<number>(0);
  const [estimatedWaitTime, setEstimatedWaitTime] = useState<number>(0);

  useEffect(() => {
    const fetchQueuePosition = async () => {
      try {
        // Get today's date
        const today = getTodayDate();
        // Build query step-by-step to avoid passing "null" as uuid in OR clause
        let query = supabase
          .from("queues")
          .select("*", { count: "exact" })
          .eq("queue_date", today)
          .eq("status", "WAITING")
          .is("paused_at", null)
          .lt("number", queue.number);

        if (queue.service_point_id) {
          query = query.or(
            `service_point_id.eq.${queue.service_point_id},service_point_id.is.null`
          );
        } else {
          // When service_point_id is null, filter explicitly with IS NULL to prevent uuid parse errors
          query = query.is("service_point_id", null);
        }

        const { count, error } = await query;

        if (error) throw error;

        setQueuePosition(count || 0);
      } catch (error) {
        console.error("Error fetching queue position:", error);
      }
    };

    const calculateEstimatedWaitTime = async () => {
      try {
        const { data: avgWaitTimeData, error: avgWaitTimeError } =
          await supabase
            .from("settings")
            .select("value")
            .eq("category", "queue")
            .eq("key", "avg_wait_time")
            .single();

        if (avgWaitTimeError) throw avgWaitTimeError;

        const avgWaitTime = avgWaitTimeData
          ? parseInt(String(avgWaitTimeData.value), 10)
          : 10; // Default to 10 minutes

        setEstimatedWaitTime(queuePosition * avgWaitTime);
      } catch (error) {
        console.error("Error calculating estimated wait time:", error);
      }
    };

    fetchQueuePosition();
    calculateEstimatedWaitTime();
  }, [queue, supabase, queuePosition]);

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
                className="bg-green-50 text-green-700 border-green-200"
              >
                คิวที่ {queue.number}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Queue Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              สถานะคิวรับยา
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {queuePosition}
              </div>
              <p className="text-gray-600">คิวก่อนหน้า</p>
            </div>

            <div className="text-center">
              <div className="text-xl font-semibold text-green-600">
                {estimatedWaitTime} นาที
              </div>
              <p className="text-gray-600">เวลารอโดยประมาณ</p>
            </div>
          </CardContent>
        </Card>

        {/* Step Out Timer - only show if queue is paused */}
        {queue.paused_at && (
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-orange-600 font-medium">
                  คิวของคุณถูกพักไว้
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  พักตั้งแต่:{" "}
                  {new Date(queue.paused_at).toLocaleTimeString("th-TH")}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

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

            {onSwitchQueue && availableQueues.length > 1 && (
              <Button
                onClick={onSwitchQueue}
                variant="outline"
                className="w-full"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                เปลี่ยนคิว
              </Button>
            )}

            {/* <Button
              onClick={onClearQueueHistory}
              variant="outline"
              className="w-full border-red-600 text-red-600 hover:bg-red-50"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              ล้างประวัติคิวเก่า
            </Button> */}

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

export default ActiveQueueView;
