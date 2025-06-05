
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Queue, Patient, QueueStatus } from '@/integrations/supabase/schema';
import { Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { formatQueueNumber } from '@/utils/queueFormatters';
import LineQRCode from '@/components/ui/LineQRCode';
import WaitingTimeProgress from './WaitingTimeProgress';
import StepOutTimer from './StepOutTimer';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';

interface PatientQueueStatusProps {
  queue: Queue;
  patient: Patient;
  className?: string;
}

const PatientQueueStatus: React.FC<PatientQueueStatusProps> = ({ queue, patient, className }) => {
  const [estimatedWaitTime, setEstimatedWaitTime] = useState<number | null>(null);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const [totalWaiting, setTotalWaiting] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const isMobile = useIsMobile();

  useEffect(() => {
    const calculateQueueInfo = async () => {
      if (queue.status === 'WAITING') {
        // Get all waiting queues to determine position
        const { data: waitingQueues, error } = await supabase
          .from('queues')
          .select('*')
          .eq('status', 'WAITING')
          .order('created_at', { ascending: true });
        
        if (error) {
          console.error('Error fetching waiting queues:', error);
          return;
        }
        
        setTotalWaiting(waitingQueues.length);
        
        // Find position of current queue in waiting queues
        const position = waitingQueues.findIndex(q => q.id === queue.id) + 1;
        setQueuePosition(position);
        
        // Estimate wait time based on position and average service time
        // Average service time calculation could be improved with historical data
        const averageServiceMinutes = 8; // Average service time per patient
        const estimatedTime = position * averageServiceMinutes;
        setEstimatedWaitTime(estimatedTime);
        setStatusMessage('กรุณารอเรียกคิว');
      } else if (queue.status === 'ACTIVE') {
        setStatusMessage('กำลังให้บริการ');
        setQueuePosition(0);
      } else if (queue.status === 'COMPLETED') {
        setStatusMessage('ให้บริการเสร็จสิ้น');
      } else if (queue.status === 'SKIPPED') {
        setStatusMessage('คิวถูกข้าม');
      }
    };
    
    calculateQueueInfo();
    
    // Set up real-time subscription to queue changes
    const channel = supabase
      .channel('queue-status-changes')
      .on('postgres_changes', 
          { event: 'UPDATE', schema: 'public', table: 'queues', filter: `id=eq.${queue.id}` },
          (payload) => {
            console.log('Queue updated:', payload);
            // Reload the page when this queue's status changes
            window.location.reload();
          }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queue]);
  
  // Handle temporary step out
  const handleStepOut = async (minutes: number) => {
    // Here we would typically update a database record
    // For now, we'll just use localStorage as demo
    console.log(`Patient ${patient.id} stepped out for ${minutes} minutes`);
    return Promise.resolve();
  };
  
  const handleStepIn = async () => {
    // Here we would typically update a database record
    console.log(`Patient ${patient.id} returned`);
    return Promise.resolve();
  };
  
  let statusIcon: JSX.Element;
  let statusColor: string;
  
  switch (queue.status) {
    case 'ACTIVE':
      statusIcon = <AlertCircle className="h-6 w-6 text-yellow-500" />;
      statusColor = 'bg-yellow-50 border-yellow-200 text-yellow-700';
      break;
    case 'COMPLETED':
      statusIcon = <CheckCircle className="h-6 w-6 text-green-500" />;
      statusColor = 'bg-green-50 border-green-200 text-green-700';
      break;
    case 'SKIPPED':
      statusIcon = <AlertCircle className="h-6 w-6 text-red-500" />;
      statusColor = 'bg-red-50 border-red-200 text-red-700';
      break;
    default:
      statusIcon = <Clock className="h-6 w-6 text-blue-500" />;
      statusColor = 'bg-blue-50 border-blue-200 text-blue-700';
  }

  return (
    <Card className={`${statusColor} border ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {statusIcon}
            <span>คิวของคุณ</span>
          </div>
          <span className="text-2xl font-bold">{formatQueueNumber(queue.type, queue.number)}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-lg font-medium">{statusMessage}</div>
          <p className="text-sm">{patient.name}</p>
        </div>
        
        {queue.status === 'WAITING' && (
          <>
            <WaitingTimeProgress 
              position={queuePosition} 
              totalWaiting={totalWaiting}
              estimatedTimeMinutes={estimatedWaitTime}
            />
            
            <StepOutTimer 
              queuePosition={queuePosition}
              estimatedCallTime={estimatedWaitTime}
              onStepOut={handleStepOut}
              onStepIn={handleStepIn}
              className="mt-4"
            />
          </>
        )}
        
        {/* <div className={`text-center ${isMobile ? 'pt-2' : 'pt-4'}`}>
          <p className="text-sm mb-2">แสกนเพื่อติดตามคิวผ่าน LINE</p>
          <div className="flex justify-center">
            <LineQRCode 
              queueNumber={queue.number} 
              queueType={queue.type} 
              size={isMobile ? 100 : 120} 
            />
          </div>
        </div> */}
      </CardContent>
    </Card>
  );
};

export default PatientQueueStatus;
