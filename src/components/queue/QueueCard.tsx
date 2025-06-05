
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Queue } from '@/integrations/supabase/schema';
import QueueTimeInfo from './QueueTimeInfo';
import { QueueCardActions, QueueCardInfo } from './card';

interface QueueCardProps {
  queue: Queue;
  patientName: string;
  onComplete?: () => Promise<Queue | null> | void;
  onSkip?: () => Promise<Queue | null> | void;
  onCall?: () => Promise<Queue | null> | void;
  onRecall?: () => void;
  onTransfer?: () => void;
  onReturnToWaiting?: () => void;
  onHold?: () => void;
  onViewPatientInfo?: () => void;
  onCancel?: () => void;
  servicePointId?: string;
  servicePointName?: string;
  suggestedServicePointName?: string;
  showServicePointInfo?: boolean;
  isPharmacyInterface?: boolean;
}

const QueueCard: React.FC<QueueCardProps> = ({
  queue,
  patientName,
  onComplete,
  onSkip,
  onCall,
  onRecall,
  onTransfer,
  onReturnToWaiting,
  onHold,
  onViewPatientInfo,
  onCancel,
  servicePointName,
  suggestedServicePointName,
  showServicePointInfo = false,
  isPharmacyInterface = false
}) => {
  const hasActions = onComplete || onSkip || onCall || onRecall || onTransfer || onReturnToWaiting || onHold || onViewPatientInfo || onCancel;
  
  return (
    <Card className={isPharmacyInterface ? "border-pharmacy-200" : ""}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <QueueCardInfo
            queue={queue}
            patientName={patientName}
            servicePointName={servicePointName}
            suggestedServicePointName={suggestedServicePointName}
            showServicePointInfo={true} // Always show service point info in pharmacy interface
          />
          
          <QueueTimeInfo queue={queue} />
        </div>
      </CardContent>
      
      {/* Show actions if any handlers are provided */}
      {hasActions && (
        <CardFooter className={`px-4 py-3 flex justify-end gap-2 flex-wrap ${
          isPharmacyInterface ? "bg-pharmacy-50" : "bg-gray-50"
        }`}>
          <QueueCardActions
            queue={queue}
            onComplete={onComplete}
            onSkip={onSkip}
            onCall={onCall}
            onRecall={onRecall}
            onTransfer={onTransfer}
            onReturnToWaiting={onReturnToWaiting}
            onHold={onHold}
            onViewPatientInfo={onViewPatientInfo}
            onCancel={onCancel}
            isPharmacyInterface={isPharmacyInterface}
          />
        </CardFooter>
      )}
    </Card>
  );
};

export default QueueCard;
