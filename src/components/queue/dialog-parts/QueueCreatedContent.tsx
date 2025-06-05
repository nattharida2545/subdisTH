
import React, { useEffect, useState } from 'react';
import { QueueType } from '@/integrations/supabase/schema';
import LineQRCode from '@/components/ui/LineQRCode';
import PatientInfoDisplay from '../PatientInfoDisplay';
import { Badge } from '@/components/ui/badge';
import { useQueues } from '@/hooks/useQueues';

interface QueueCreatedContentProps {
  formattedQueueNumber: string;
  queueNumber: number;
  queueType: QueueType;
  patientName?: string;
  patientPhone?: string;
  patientLineId?: string;
}

const QueueCreatedContent: React.FC<QueueCreatedContentProps> = ({
  formattedQueueNumber,
  queueNumber,
  queueType,
  patientName,
  patientPhone,
  patientLineId,
}) => {
  // Access queues from the hook
  const queuesResult = useQueues();
  const queues = queuesResult?.queues || [];
  const sortQueues = queuesResult?.sortQueues || ((q) => q);
  
  const [estimatedWaitTime, setEstimatedWaitTime] = useState<number>(15);
  
  // Calculate the estimated wait time based on queue position and current workload
  useEffect(() => {
    if (queues && Array.isArray(queues)) {
      const waitingQueues = queues.filter(q => q.status === 'WAITING');
      // Clone the array to avoid mutation issues when sorting
      const queuesCopy = [...waitingQueues];
      const sortedQueues = sortQueues(queuesCopy);
      
      // Find the position of the new queue in the waiting list
      const queuePosition = sortedQueues.findIndex(q => 
        q.number === queueNumber && q.type === queueType
      ) + 1;
      
      // Apply wait time calculation based on position and average service time
      const avgServiceTimePerPatient = 5; // minutes per patient on average
      let calculatedWaitTime = 0;
      
      if (queuePosition > 0) {
        calculatedWaitTime = queuePosition * avgServiceTimePerPatient;
      } else {
        // If we can't find the queue in the list, use default calculation
        calculatedWaitTime = waitingQueues.length * avgServiceTimePerPatient;
      }
      
      // Add a buffer for more realistic estimation
      calculatedWaitTime = Math.round(calculatedWaitTime * 1.2);
      
      // Minimum wait time of 5 minutes, maximum of 60 minutes display
      setEstimatedWaitTime(Math.max(5, Math.min(60, calculatedWaitTime)));
    }
  }, [queues, queueNumber, queueType, sortQueues]);

  return (
    <div className="flex flex-col items-center justify-center py-4">
      <PatientInfoDisplay 
        patientName={patientName}
        patientPhone={patientPhone}
        patientLineId={patientLineId}
        formattedQueueNumber={formattedQueueNumber}
      />
      
      <div className="my-3 text-center">
        <Badge variant="outline" className="bg-pharmacy-50 text-pharmacy-700 border-pharmacy-200 px-3 py-1">
          เวลารอโดยประมาณ: {estimatedWaitTime} นาที
        </Badge>
      </div>
      
      <div className="w-full max-w-[250px] mx-auto">
        <LineQRCode 
          queueNumber={queueNumber} 
          queueType={queueType} 
          className="w-full" 
        />
        <p className="text-center text-sm text-gray-500 mt-2">
          สแกนเพื่อรับการแจ้งเตือนผ่าน LINE เมื่อถึงคิวของคุณ
        </p>
      </div>
    </div>
  );
};

export default QueueCreatedContent;
