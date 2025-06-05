
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, SkipForward, PhoneCall, PhoneForwarded, RotateCcw, ArrowRightFromLine, User, X, Volume2, Pause } from 'lucide-react';
import { Queue } from '@/integrations/supabase/schema';
import { announceQueue } from '@/utils/textToSpeech';
import { getServicePointById } from '@/utils/servicePointUtils';
import { toast } from 'sonner';

interface QueueCardActionsProps {
  queue: Queue;
  onComplete?: () => Promise<Queue | null> | void;
  onSkip?: () => Promise<Queue | null> | void;
  onCall?: () => Promise<Queue | null> | void;
  onRecall?: () => void;
  onTransfer?: () => void;
  onReturnToWaiting?: () => void;
  onHold?: () => void;
  onViewPatientInfo?: () => void;
  onCancel?: () => void;
  isPharmacyInterface?: boolean;
}

const QueueCardActions: React.FC<QueueCardActionsProps> = ({
  queue,
  onComplete,
  onSkip,
  onCall,
  onRecall,
  onTransfer,
  onReturnToWaiting,
  onHold,
  onViewPatientInfo,
  onCancel,
  isPharmacyInterface = false
}) => {
  // Function to handle queue announcement
  const handleAnnounceQueue = async () => {
    try {
      // Get service point information if available
      const servicePointInfo = queue.service_point_id 
        ? await getServicePointById(queue.service_point_id)
        : null;
      
      // Use counter name from localStorage as fallback
      const counterName = localStorage.getItem('queue_counter_name') || '1';
      
      await announceQueue(
        queue.number,
        servicePointInfo || { code: '', name: counterName },
        queue.type
      );
      toast.info(`ประกาศเสียงเรียกคิวหมายเลข ${queue.number} เรียบร้อยแล้ว`);
    } catch (error) {
      console.error("Error announcing queue:", error);
      toast.error("ไม่สามารถประกาศเสียงเรียกคิวได้");
    }
  };

  const isPausedQueue = !!queue.paused_at;

  return (
    <>
      {/* Patient Info Button - Show for waiting, active, and paused queues */}
      {onViewPatientInfo && (queue.status === 'ACTIVE' || queue.status === 'WAITING' || isPausedQueue) && (
        <Button variant="outline" size="sm" onClick={onViewPatientInfo}>
          <User className="h-4 w-4 mr-1" />
          ข้อมูลผู้ป่วย
        </Button>
      )}
      
      {/* Cancel Queue - Show for waiting queues (not paused) */}
      {onCancel && queue.status === 'WAITING' && !isPausedQueue && (
        <Button variant="outline" size="sm" onClick={onCancel} className="border-red-200 text-red-700 hover:bg-red-50">
          <X className="h-4 w-4 mr-1" />
          ยกเลิก
        </Button>
      )}
      
      {/* Return to Waiting - Show for skipped queues or paused queues */}
      {onReturnToWaiting && (queue.status === 'SKIPPED' || isPausedQueue) && (
        <Button variant="outline" size="sm" onClick={onReturnToWaiting}>
          <RotateCcw className="h-4 w-4 mr-1" />
          {isPausedQueue ? 'คืนสู่คิว' : 'กลับรอคิว'}
        </Button>
      )}
      
      {/* Hold Queue - Show for active queues */}
      {onHold && queue.status === 'ACTIVE' && (
        <Button variant="outline" size="sm" onClick={onHold}>
          <Pause className="h-4 w-4 mr-1" />
          พัก
        </Button>
      )}
      
      {/* Transfer Queue - Show for active queues */}
      {onTransfer && queue.status === 'ACTIVE' && (
        <Button variant="outline" size="sm" onClick={onTransfer}>
          <ArrowRightFromLine className="h-4 w-4 mr-1" />
          โอน
        </Button>
      )}
      
      {/* Skip Queue - Show for waiting and active queues */}
      {onSkip && (queue.status === 'WAITING' || queue.status === 'ACTIVE') && !isPausedQueue && (
        <Button variant="outline" size="sm" onClick={onSkip}>
          <SkipForward className="h-4 w-4 mr-1" />
          ข้าม
        </Button>
      )}
      
      {/* Call Queue - Primary action for waiting queues (including paused) */}
      {onCall && (queue.status === 'WAITING' || isPausedQueue) && (
        <Button 
          variant="default" 
          size="sm" 
          onClick={onCall}
          className={isPharmacyInterface ? "bg-pharmacy-600 hover:bg-pharmacy-700" : ""}
        >
          <PhoneCall className="h-4 w-4 mr-1" />
          เรียกคิว
        </Button>
      )}
      
      {/* Recall Queue - Show for active queues */}
      {onRecall && queue.status === 'ACTIVE' && (
        <Button variant="outline" size="sm" onClick={onRecall} 
          className="border-blue-200 text-blue-700 hover:bg-blue-50">
          <PhoneForwarded className="h-4 w-4 mr-1" />
          เรียกซ้ำ
        </Button>
      )}

      {/* Complete Service - Show for active queues */}
      {onComplete && queue.status === 'ACTIVE' && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onComplete}
          className={isPharmacyInterface ? "border-green-200 text-green-700 hover:bg-green-50" : "border-green-200 text-green-700 hover:bg-green-50"}
        >
          <Check className="h-4 w-4 mr-1" />
          เสร็จสิ้น
        </Button>
      )}
    </>
  );
};

export default QueueCardActions;
