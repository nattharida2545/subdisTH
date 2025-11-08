import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import { QueueIns, ServicePointIns } from "@/integrations/supabase/schema";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  X,
  Clock,
  User,
  PhoneCall,
  Pause,
  ArrowRightLeft,
  RotateCw,
  SkipForward,
  PhoneForwarded,
  ArrowRightFromLine,
  Calendar,
  CreditCard,
  Home,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";
import { formatQueueInsNumber } from "@/utils/queueInsFormatters";
import { announceQueue } from "@/utils/textToSpeech";
import { maskIdCard } from "@/utils/formatters";

interface InsQueueTabContentProps {
  value?: string;
  queues: QueueIns[];
  emptyMessage: string;
  getIdCard?: (queue: QueueIns) => string;
  onViewPatientInfo?: (queue: QueueIns, tabType: string) => void;
  onCallQueue?: (queueId: string) => void;
  onUpdateStatus?: (queueId: string, status: string) => void;
  onRecallQueue?: (queueId: string) => void;
  onHoldQueue?: (queueId: string) => void;
  onTransferClick?: (queueId: string) => void;
  onReturnToWaiting?: (queueId: string) => void;
  onCancelQueue?: (queueId: string) => void;
  onCompleteQueue?: (queueId: string) => void;
  isCompleted?: boolean;
  isCancelled?: boolean;
  onTabChange?: (value: string) => void;
  servicePoints?: ServicePointIns[];
  selectedServicePoint?: ServicePointIns;
}

const InsQueueTabContent: React.FC<InsQueueTabContentProps> = ({
  value,
  queues,
  emptyMessage,
  getIdCard,
  onViewPatientInfo,
  onCallQueue,
  onUpdateStatus,
  onTabChange,
  onRecallQueue,
  onHoldQueue,
  onTransferClick,
  onReturnToWaiting,
  onCancelQueue,
  onCompleteQueue,
  isCompleted = false,
  isCancelled = false,
  servicePoints,
  selectedServicePoint,
}) => {
  if (!Array.isArray(queues) || queues.length === 0) {
    return (
      <TabsContent value={value || ""} className="h-full">
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      </TabsContent>
    );
  }

  return (
    <TabsContent value={value || ""} className="h-full">
      <div className="space-y-4 p-4">
        {queues.map((queue) => (
          <Card key={queue.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() =>
                    onViewPatientInfo && onViewPatientInfo(queue, value || "")
                  }
                >
                  {/* Queue number and type */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl font-bold text-gray-900">
                      {formatQueueInsNumber(queue.type, queue.number)}
                    </span>
                    <Badge variant="default">{queue.type}</Badge>
                  </div>

                  {/* Full name */}
                  <div className="flex items-center gap-1 text-gray-700 mb-1">
                    <User className="w-4 h-4" />
                    <span className="font-medium">
                      {queue.full_name || "ไม่ระบุชื่อ"}
                    </span>
                  </div>

                  {/* Patient ID card - showing full ID */}
                  <div className="flex items-center gap-1 text-gray-700 mb-1">
                    <CreditCard className="w-4 h-4" />
                    <span className="font-medium">
                      {getIdCard ? getIdCard(queue) : queue.ID_card}
                    </span>
                  </div>

                  {/* House number and Moo */}
                  <div className="flex items-center gap-1 text-gray-700 mb-1">
                    <Home className="w-4 h-4" />
                    <span className="font-medium">
                      {queue.house_number || "-"} หมู่ {queue.moo || "-"}
                    </span>
                  </div>

                  {/* Service point info if available */}
                  {/* {queue.service_point_id && (
                    <div className="mt-2">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">จุดบริการ:</span> {queue.service_point_id}
                      </div>
                    </div>
                  )} */}

                  {/* Queue time info */}
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    {queue.created_at && (
                      <span>
                        {formatDistanceToNow(new Date(queue.created_at), {
                          addSuffix: true,
                          locale: th,
                        })}
                      </span>
                    )}
                  </div>

                  {/* Notes section removed as it's not available in QueueIns type */}
                </div>
              </div>
            </CardContent>

            {/* Card Footer with Actions */}
            {(value === "waiting" ||
              value === "active" ||
              value === "paused" ||
              value === "skipped") && (
              <CardFooter className="px-4 py-3 flex justify-end gap-2 flex-wrap bg-gray-50">
                {/* Patient Info Button - Show for all tabs */}
                {onViewPatientInfo && (
                  <Button variant="outline" size="sm" onClick={() => onViewPatientInfo(queue, value || "")}>
                    <User className="h-4 w-4 mr-1" />
                    ข้อมูลผู้ป่วย
                  </Button>
                )}

                {/* Cancel Queue - Show for waiting queues */}
                {value === "waiting" && onCancelQueue && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onCancelQueue(queue.id)}
                    className="border-red-200 text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4 mr-1" />
                    ยกเลิก
                  </Button>
                )}

                {/* Return to Waiting - Show for skipped or paused queues */}
                {(value === "skipped" || value === "paused") &&
                  onReturnToWaiting && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onReturnToWaiting(queue.id)}
                    >
                      <RotateCw className="h-4 w-4 mr-1" />
                      {value === "paused" ? "คืนสู่คิว" : "กลับรอคิว"}
                    </Button>
                  )}

                {/* Hold Queue - Show for active queues */}
                {value === "active" && onHoldQueue && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onHoldQueue(queue.id);
                      // Navigate to paused tab when queue is paused
                    }}
                  >
                    <Pause className="h-4 w-4 mr-1" />
                    พัก
                  </Button>
                )}

                {/* Transfer Queue - Show for active queues */}
                {value === "active" && onTransferClick && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onTransferClick(queue.id)}
                  >
                    <ArrowRightFromLine className="h-4 w-4 mr-1" />
                    โอน
                  </Button>
                )}

                {/* Call Queue - Primary action for waiting and paused queues */}
                {(value === "waiting" || value === "paused") && onCallQueue && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      onCallQueue(queue.id);
                      // Announce queue when called
                      // const sp = servicePoints?.find(
                      //   (sp) => sp.id === selectedServicePoint?.id
                      // );
                      announceQueue(
                        queue.number,
                        {
                          code: selectedServicePoint?.code,
                          name: selectedServicePoint?.name,
                        },
                        queue.type
                      );
                    }}
                  >
                    <PhoneCall className="h-4 w-4 mr-1" />
                    เรียกคิว
                  </Button>
                )}

                {/* Skip Queue - Show for active queues */}
                {value === "active" && onUpdateStatus && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUpdateStatus(queue.id, "SKIPPED")}
                  >
                    <SkipForward className="h-4 w-4 mr-1" />
                    ข้าม
                  </Button>
                )}

                {/* Recall Queue - Show for active queues */}
                {value === "active" && onRecallQueue && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onRecallQueue(queue.id);
                      // Announce queue when recalled
                      const sp = servicePoints?.find(
                        (sp) => sp.id === queue.service_point_id
                      );
                      announceQueue(
                        queue.number,
                        { code: sp?.code, name: sp?.name },
                        queue.type
                      );
                    }}
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <PhoneForwarded className="h-4 w-4 mr-1" />
                    เรียกซ้ำ
                  </Button>
                )}

                {/* Complete Service - Show for active queues */}
                {value === "active" && onUpdateStatus && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUpdateStatus(queue.id, "COMPLETED")}
                    className="border-green-200 text-green-700 hover:bg-green-50"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    เสร็จสิ้น
                  </Button>
                )}
              </CardFooter>
            )}

            {/* Completed tab - show status only */}
            {value === "completed" && (
              <CardFooter className="px-4 py-3 flex justify-end items-center bg-gray-50">
                <div className="flex items-center text-green-600">
                  <Check className="h-4 w-4 mr-1" />
                  <span className="text-sm">เสร็จสิ้น</span>
                </div>
              </CardFooter>
            )}

            {/* Cancelled tab - show status only */}
            {value === "cancelled" && (
              <CardFooter className="px-4 py-3 flex justify-end items-center bg-gray-50">
                <div className="flex items-center text-red-600">
                  <X className="h-4 w-4 mr-1" />
                  <span className="text-sm">ยกเลิก</span>
                </div>
              </CardFooter>
            )}
          </Card>
        ))}
      </div>
    </TabsContent>
  );
};

export default InsQueueTabContent;
