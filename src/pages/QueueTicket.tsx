import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Clock, Printer, Share2 } from "lucide-react";
import PatientInfoDisplay from "@/components/queue/PatientInfoDisplay";
import LineQRCode from "@/components/ui/LineQRCode";
import { formatQueueNumber } from "@/utils/queueFormatters";
import { useQueues } from "@/hooks/useQueues";
import { usePatients } from "@/hooks/usePatients";
import { printQueueTicket } from "@/utils/printUtils";
import { QueueTypeEnum } from "@/integrations/supabase/schema";
import { Badge } from "@/components/ui/badge";

const QueueTicket = () => {
  const { id } = useParams<{ id: string }>();
  const { queues, sortQueues } = useQueues();
  const { patients } = usePatients();
  const [estimatedWaitTime, setEstimatedWaitTime] = useState<number>(15);
  const [waitTiemQueueNext, setWaitTiemQueueNext] = useState<number>(0);

  const queue = queues.find((q) => q.id === id);
  const patient = queue
    ? patients.find((p) => p.id === queue.patient_id)
    : null;

  async function calculateWaitTimeQueueNext() {
    if (queue && queue.status === "WAITING") {
      const waitingQueues = queues.filter((q) => q.status === "WAITING");
      const sortedQueues = sortQueues(waitingQueues);

      // Find position of current queue in the sorted waiting queues
      const queuePosition = sortedQueues.findIndex((q) => q.id === id) + 1;

      // Calculate wait time: 10 minutes per queue
      const waitTimePerQueue = 10;
      const calculatedTime = queuePosition * waitTimePerQueue;

      setWaitTiemQueueNext(calculatedTime);
      return calculatedTime;
    }
    return 0;
  }

  // Calculate estimated wait time
  useEffect(() => {
    calculateWaitTimeQueueNext();
    if (queue && queue.status === "WAITING") {
      const waitingQueues = queues.filter((q) => q.status === "WAITING");
      const sortedQueues = sortQueues(waitingQueues);

      const queuePosition = sortedQueues.findIndex((q) => q.id === id) + 1;

      // Average service time per patient in minutes
      const avgServiceTimePerPatient = 5;
      let calculatedTime = 0;

      if (queuePosition > 0) {
        calculatedTime = queuePosition * avgServiceTimePerPatient;
      } else {
        calculatedTime = waitingQueues.length * avgServiceTimePerPatient;
      }

      // Add buffer for realistic estimation
      calculatedTime = Math.round(calculatedTime * 1.2);
      setEstimatedWaitTime(Math.max(5, Math.min(60, calculatedTime)));
    }
  }, [queue, queues, id, sortQueues]);

  if (!queue) {
    return (
      <div className="max-w-md mx-auto mt-12 px-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-lg text-gray-700 mb-4">ไม่พบข้อมูลคิว</p>
              <Link to="/">
                {/* <Button variant="outline" className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  กลับไปหน้าหลัก
                </Button> */}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formattedQueueNumber = formatQueueNumber(
    queue.type as QueueTypeEnum,
    queue.number
  );

  const handlePrint = async () => {
    await printQueueTicket({
      queueNumber: queue.number,
      queueType: queue.type as QueueTypeEnum,
      patientName: patient?.name,
      patientPhone: patient?.phone,
      patientLineId: patient?.line_id,
      purpose: queue.notes,
      estimatedWaitTime:
        queue.status === "WAITING" ? estimatedWaitTime : undefined,
      waitTiemQueueNext: waitTiemQueueNext,
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `คิวหมายเลข ${formattedQueueNumber}`,
          text: `ติดตามคิวรับยาเลขที่ ${formattedQueueNumber}`,
          url: window.location.href,
        })
        .catch((error) => console.log("Error sharing", error));
    }
  };

  return (
    <div className="max-w-md mx-auto mt-4 px-4 pb-12">
      <div className="mb-6">
        <Link to="/">
          {/* <Button variant="ghost" size="sm" className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            กลับไปหน้าหลัก
          </Button> */}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">รายละเอียดคิว</h1>
        <p className="text-gray-600">คิวรับยาของคุณ</p>
      </div>

      <Card className="overflow-hidden mb-6">
        <CardContent className="p-6">
          <PatientInfoDisplay
            patientName={patient?.name}
            patientPhone={patient?.phone}
            patientLineId={patient?.line_id}
            formattedQueueNumber={formattedQueueNumber}
            className="mb-4"
          />

          {queue.status === "WAITING" && (
            <div className="flex justify-center mb-4">
              <Badge
                variant="outline"
                className="bg-pharmacy-50 text-pharmacy-700 border-pharmacy-200 px-3 py-1"
              >
                เวลารอโดยประมาณ: {estimatedWaitTime} นาที
              </Badge>
            </div>
          )}

          <LineQRCode
            queueNumber={queue.number}
            queueType={queue.type as QueueTypeEnum}
            className="w-full max-w-[250px] mx-auto"
          />

          <div className="mt-6">
            <p className="text-sm text-gray-500 text-center mb-4">
              ใช้เพื่อติดตามสถานะคิวของคุณ โดยสแกน QR Code ด้านบน
            </p>

            {queue.notes && (
              <div className="bg-gray-50 p-3 rounded-md mb-4">
                <p className="text-sm text-gray-600">{queue.notes}</p>
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handlePrint}
              >
                <Printer className="h-4 w-4 mr-2" />
                พิมพ์บัตรคิว
              </Button>

              <Button
                className="flex-1 bg-pharmacy-600 hover:bg-pharmacy-700"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 mr-2" />
                แชร์
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-gray-500">
        <p>
          ออกบัตรคิวเมื่อ {new Date(queue.created_at).toLocaleString("th-TH")}
        </p>
      </div>
    </div>
  );
};

export default QueueTicket;
