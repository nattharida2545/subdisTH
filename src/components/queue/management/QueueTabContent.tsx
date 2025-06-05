
import * as React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Queue, Patient, ServicePoint, QueueStatus } from '@/integrations/supabase/schema';
import QueueList from '../QueueList';
import { QueueType } from '@/hooks/useQueueTypes';

interface QueueTabContentProps {
  queues: Queue[];
  patients: Patient[];
  status: QueueStatus;
  getPatientName: (patientId: string) => string;
  onUpdateStatus?: (queueId: string, status: QueueStatus) => Promise<Queue | null>;
  onCallQueue?: (queueId: string, manualServicePointId?: string) => Promise<Queue | null>;
  onRecallQueue?: (queueId: string) => void;
  onTransferQueue?: (queueId: string) => void;
  onHoldQueue?: (queueId: string) => void;
  onReturnToWaiting?: (queueId: string) => Promise<boolean>;
  onViewPatientInfo?: (patientId: string) => void;
  selectedServicePoint?: ServicePoint | null;
  servicePoints: ServicePoint[];
  getIntelligentServicePointSuggestion?: (queue: Queue) => ServicePoint | null;
  isPharmacyInterface?: boolean;
}

const QueueTabContent: React.FC<QueueTabContentProps> = ({
  queues,
  patients,
  status,
  getPatientName,
  onUpdateStatus,
  onCallQueue,
  onRecallQueue,
  onTransferQueue,
  onHoldQueue,
  onReturnToWaiting,
  onViewPatientInfo,
  selectedServicePoint,
  servicePoints,
  getIntelligentServicePointSuggestion,
  isPharmacyInterface = false
}) => {
  return (
    <Card className="h-full border-0 shadow-none">
      <CardContent className="h-full p-0">
        <QueueList
          queues={queues}
          getPatientName={getPatientName}
          onUpdateStatus={onUpdateStatus}
          onCallQueue={onCallQueue}
          onRecallQueue={onRecallQueue}
          onTransferQueue={onTransferQueue}
          onHoldQueue={onHoldQueue}
          onReturnToWaiting={onReturnToWaiting}
          onViewPatientInfo={onViewPatientInfo}
          status={status}
          selectedServicePoint={selectedServicePoint}
          servicePoints={servicePoints}
          getIntelligentServicePointSuggestion={getIntelligentServicePointSuggestion}
          showServicePointInfo={true}
          isPharmacyInterface={isPharmacyInterface}
        />
      </CardContent>
    </Card>
  );
};

export default QueueTabContent;
