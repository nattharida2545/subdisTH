import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Patient, Queue, QueueIns } from "@/integrations/supabase/schema";
import { formatQueueNumber } from "@/utils/queueFormatters";
import { Calendar, Clock, User, Home, CreditCard } from "lucide-react";
import { appointmentQueueService } from "@/services/appointmentQueueService";

interface QueueCardInfoProps {
  queue: Queue;
  patient: Patient;
  patientName: string;
  servicePointName?: string;
  suggestedServicePointName?: string;
  showServicePointInfo?: boolean;
  getIdCard?: (queue: QueueIns) => string;
}

const QueueCardInfo: React.FC<QueueCardInfoProps> = ({
  queue,
  patient,
  patientName,
  servicePointName,
  suggestedServicePointName,
  showServicePointInfo = true,
}) => {
  const [appointmentInfo, setAppointmentInfo] = useState<any>(null);

  // Fetch appointment info if this queue is linked to an appointment
  useEffect(() => {
    const fetchAppointmentInfo = async () => {
      if (queue.appointment_id) {
        const appointment =
          await appointmentQueueService.getAppointmentByQueueId(queue.id);
        setAppointmentInfo(appointment);
      }
    };

    fetchAppointmentInfo();
  }, [queue.id, queue.appointment_id]);

  console.log("que", queue);

  return (
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl font-bold text-gray-900">
          {formatQueueNumber(queue.type, queue.number)}
        </span>
        <Badge variant={queue.type === "APPOINTMENT" ? "default" : "secondary"}>
          {queue.type === "APPOINTMENT" ? "นัดหมาย" : queue.type}
        </Badge>
      </div>

      <div className="flex items-center gap-1 text-gray-700 mb-1">
        <User className="w-4 h-4" />
        <span className="font-medium">{patientName}</span>
      </div>

      {/* Patient ID card - showing full ID */}
      <div className="flex items-center gap-1 text-gray-700 mb-1">
        <CreditCard className="w-4 h-4" />
        <span className="font-medium">{patient?.ID_card}</span>
      </div>

      {/* House number and Moo */}
      {patient?.address && (
        <div className="flex items-center gap-1 text-gray-700 mb-1">
          <Home className="w-4 h-4" />
          <span className="font-medium">{patient?.address}</span>
        </div>
      )}

      {/* Show appointment information if available */}
      {appointmentInfo && (
        <div className="mt-2 p-2 bg-blue-50 rounded-md border border-blue-200">
          <div className="flex items-center gap-1 text-blue-700 text-sm mb-1">
            <Calendar className="w-3 h-3" />
            <span className="font-medium">นัดหมาย:</span>
          </div>
          <div className="text-sm text-blue-600">
            <div className="flex items-center gap-1 mb-1">
              <Clock className="w-3 h-3" />
              <span>
                {new Date(appointmentInfo.date).toLocaleDateString("th-TH", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div className="font-medium">{appointmentInfo.purpose}</div>
            {appointmentInfo.notes && (
              <div className="text-xs text-blue-500 mt-1">
                {appointmentInfo.notes}
              </div>
            )}
          </div>
        </div>
      )}

      {showServicePointInfo && (
        <div className="mt-2">
          {servicePointName ? (
            <div className="text-sm text-gray-600">
              <span className="font-medium">จุดบริการ:</span> {servicePointName}
            </div>
          ) : suggestedServicePointName ? (
            <div className="text-sm text-orange-600">
              <span className="font-medium">แนะนำ:</span>{" "}
              {suggestedServicePointName}
            </div>
          ) : (
            <div className="text-sm text-gray-400">ยังไม่ได้กำหนดจุดบริการ</div>
          )}
        </div>
      )}

      {queue.notes && (
        <div className="mt-2 text-sm text-gray-600">
          <span className="font-medium">หมายเหตุ:</span> {queue.notes}
        </div>
      )}
    </div>
  );
};

export default QueueCardInfo;
