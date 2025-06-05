
import React from 'react';
import { InfoIcon } from 'lucide-react';
import { Queue } from '@/integrations/supabase/schema';
import { formatQueueNumber } from '@/utils/queueFormatters';
import QueueTypeLabel from '../QueueTypeLabel';
import ServicePointBadge from '../ServicePointBadge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface QueueCardInfoProps {
  queue: Queue;
  patientName: string;
  servicePointName?: string;
  suggestedServicePointName?: string;
  showServicePointInfo?: boolean;
}

const QueueCardInfo: React.FC<QueueCardInfoProps> = ({
  queue,
  patientName,
  servicePointName,
  suggestedServicePointName,
  showServicePointInfo = false
}) => {
  const formattedNumber = formatQueueNumber(queue.type, queue.number);
  
  return (
    <div className="space-y-3">
      {/* Queue Number and Patient Name */}
      <div>
        <div className="text-xl sm:text-2xl font-bold">{formattedNumber}</div>
        <div className="text-gray-600 font-medium">{patientName}</div>
      </div>

      {/* Service Point Badge - More Prominent */}
      {showServicePointInfo && (
        <div className="flex items-center">
          <ServicePointBadge
            servicePointName={servicePointName}
            suggestedServicePointName={suggestedServicePointName}
            isAssigned={!!queue.service_point_id}
            className="text-sm"
          />
        </div>
      )}
      
      {/* Queue Type and Notes */}
      <div className="flex items-center flex-wrap gap-2">
        <QueueTypeLabel queueType={queue.type} />
        {queue.notes && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="w-4 h-4 text-gray-500" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{queue.notes}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
};

export default QueueCardInfo;
