import React, { useState } from "react";
import {
  Patient,
  Queue,
  QueueStatus,
  ServicePoint,
} from "@/integrations/supabase/schema";
import QueueCard from "./QueueCard";
import ServicePointQueueSelector from "./ServicePointQueueSelector";

interface QueueListProps {
  queues: Queue[];
  getPatientName: (patientId: string) => string;
  status: QueueStatus;
  onUpdateStatus?: (
    queueId: string,
    status: QueueStatus
  ) => Promise<Queue | null>;
  onCallQueue?: (
    queueId: string,
    manualServicePointId?: string
  ) => Promise<Queue | null>;
  onRecallQueue?: (queueId: string) => void;
  onTransferQueue?: (queueId: string) => void;
  onHoldQueue?: (queueId: string) => void;
  onReturnToWaiting?: (queueId: string) => void;
  onViewPatientInfo?: (patientId: string) => void;
  selectedServicePoint?: ServicePoint | null;
  servicePoints?: ServicePoint[];
  getIntelligentServicePointSuggestion?: (queue: Queue) => ServicePoint | null;
  showServicePointInfo?: boolean;
  isPharmacyInterface?: boolean;
  getPatientById: (patientId: string) => Patient;
}

const QueueList: React.FC<QueueListProps> = ({
  queues,
  getPatientName,
  status,
  onUpdateStatus,
  onCallQueue,
  onRecallQueue,
  onTransferQueue,
  onHoldQueue,
  onReturnToWaiting,
  onViewPatientInfo,
  selectedServicePoint,
  servicePoints = [],
  getIntelligentServicePointSuggestion,
  showServicePointInfo = true,
  isPharmacyInterface = false,
  getPatientById,
}) => {
  const [selectorQueue, setSelectorQueue] = useState<Queue | null>(null);
  const [suggestedServicePoint, setSuggestedServicePoint] =
    useState<ServicePoint | null>(null);

  // Enhanced empty state messages based on status and paused state
  const getEmptyStateMessage = () => {
    const isPausedTab = queues.some((q) => q.paused_at); // Check if this is the paused tab

    if (isPausedTab) {
      return {
        title: "ไม่มีคิวที่พัก",
        description: "ไม่มีคิวที่ถูกพักไว้",
      };
    }

    switch (status) {
      case "WAITING":
        return {
          title: "ไม่มีคิวที่รอดำเนินการ",
          description: "ไม่พบคิวที่รอดำเนินการ",
        };
      case "ACTIVE":
        return {
          title: "ไม่มีคิวที่กำลังให้บริการ",
          description: "ไม่มีคิวที่กำลังให้บริการ",
        };
      case "COMPLETED":
        return {
          title: "ไม่มีคิวที่เสร็จสิ้น",
          description: "ไม่มีคิวที่เสร็จสิ้นแล้ว",
        };
      case "SKIPPED":
        return {
          title: "ไม่มีคิวที่ถูกข้าม",
          description: "ไม่มีคิวที่ถูกข้าม",
        };
      default:
        return {
          title: "ไม่มีคิวในสถานะนี้",
          description: "ไม่พบคิวในสถานะนี้",
        };
    }
  };

  // Show empty state if no queues
  if (queues.length === 0) {
    const emptyState = getEmptyStateMessage();

    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center p-8">
          <div
            className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
              isPharmacyInterface ? "bg-pharmacy-100" : "bg-gray-100"
            }`}
          >
            <div
              className={`w-8 h-8 rounded opacity-50 ${
                isPharmacyInterface ? "bg-pharmacy-300" : "bg-gray-300"
              }`}
            ></div>
          </div>
          <p className="text-gray-500 mb-2 font-medium">{emptyState.title}</p>
          <p className="text-sm text-gray-400">{emptyState.description}</p>
        </div>
      </div>
    );
  }

  const handleCallQueue = async (queue: Queue) => {
    // If queue already has service point or if we're in a service point view, call directly
    if (queue.service_point_id || selectedServicePoint) {
      return onCallQueue?.(queue.id);
    }

    // If we're in global management and queue has no service point, show selector
    if (getIntelligentServicePointSuggestion && servicePoints.length > 0) {
      const suggestion = getIntelligentServicePointSuggestion(queue);
      setSuggestedServicePoint(suggestion);
      setSelectorQueue(queue);
    } else {
      // Fallback to direct call
      return onCallQueue?.(queue.id);
    }
  };

  const handleServicePointConfirm = async (servicePointId: string) => {
    if (selectorQueue && onCallQueue) {
      await onCallQueue(selectorQueue.id, servicePointId);
      setSelectorQueue(null);
      setSuggestedServicePoint(null);
    }
  };

  const handleSelectorClose = () => {
    setSelectorQueue(null);
    setSuggestedServicePoint(null);
  };

  console.log(typeof getPatientById);

  return (
    <>
      <div className="h-full overflow-auto">
        <div className="space-y-3 p-6">
          {queues.map((queue) => {
            // Get current service point for this queue
            const currentServicePoint = queue.service_point_id
              ? servicePoints.find((sp) => sp.id === queue.service_point_id)
              : null;

            // Get intelligent suggestion for unassigned queues
            const suggestedServicePoint =
              !currentServicePoint && getIntelligentServicePointSuggestion
                ? getIntelligentServicePointSuggestion(queue)
                : null;

            // Determine if this is a paused queue
            const isPausedQueue = !!queue.paused_at;

            return (
              <QueueCard
                key={queue.id}
                queue={queue}
                patientData={getPatientById(queue.patient_id)}
                patientName={getPatientName(queue.patient_id)}
                onComplete={
                  onUpdateStatus && status !== "COMPLETED"
                    ? () => onUpdateStatus(queue.id, "COMPLETED")
                    : undefined
                }
                onSkip={
                  onUpdateStatus &&
                  (status === "WAITING" || status === "ACTIVE")
                    ? () => onUpdateStatus(queue.id, "SKIPPED")
                    : undefined
                }
                onCall={
                  onCallQueue && (status === "WAITING" || isPausedQueue)
                    ? () => handleCallQueue(queue)
                    : undefined
                }
                onRecall={
                  onRecallQueue && status === "ACTIVE"
                    ? () => onRecallQueue(queue.id)
                    : undefined
                }
                onTransfer={
                  onTransferQueue && status === "ACTIVE"
                    ? () => onTransferQueue(queue.id)
                    : undefined
                }
                onHold={
                  onHoldQueue && status === "ACTIVE"
                    ? () => onHoldQueue(queue.id)
                    : undefined
                }
                onReturnToWaiting={
                  onReturnToWaiting && (status === "SKIPPED" || isPausedQueue)
                    ? () => onReturnToWaiting(queue.id)
                    : undefined
                }
                onViewPatientInfo={
                  onViewPatientInfo
                    ? () => onViewPatientInfo(queue.patient_id)
                    : undefined
                }
                servicePointId={queue.service_point_id}
                servicePointName={currentServicePoint?.name}
                suggestedServicePointName={suggestedServicePoint?.name}
                showServicePointInfo={showServicePointInfo}
                isPharmacyInterface={isPharmacyInterface}
              />
            );
          })}
        </div>
      </div>

      {/* Service Point Selector Dialog */}
      {selectorQueue && (
        <ServicePointQueueSelector
          isOpen={true}
          onClose={handleSelectorClose}
          onConfirm={handleServicePointConfirm}
          queue={selectorQueue}
          servicePoints={servicePoints}
          suggestedServicePoint={suggestedServicePoint}
        />
      )}
    </>
  );
};

export default QueueList;
