
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Calendar, X, AlertTriangle } from 'lucide-react';
import { Queue } from '@/integrations/supabase/schema';
import { formatQueueNumber } from '@/utils/queueFormatters';

interface QueueCardProps {
  queue: Queue;
  onCancelQueue: (queueId: string) => void;
  cancellingQueue: string | null;
}

const QueueCard: React.FC<QueueCardProps> = ({
  queue,
  onCancelQueue,
  cancellingQueue
}) => {
  const isPriority = queue.type === 'PRIORITY';

  const getQueueTypeLabel = (type: string) => {
    switch (type) {
      case 'PRIORITY':
        return 'ด่วน';
      case 'GENERAL':
        return 'ทั่วไป';
      case 'APPOINTMENT':
        return 'นัดหมาย';
      default:
        return type;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('th-TH', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Card 
      className={`${
        isPriority ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'
      }`}
    >
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`text-xl font-bold ${
              isPriority ? 'text-red-600' : 'text-pharmacy-600'
            }`}>
              {formatQueueNumber(queue.type, queue.number)}
            </div>
            <div className="flex flex-col">
              <Badge 
                variant={isPriority ? "destructive" : "secondary"}
                className="text-xs w-fit"
              >
                {getQueueTypeLabel(queue.type)}
              </Badge>
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                <Calendar className="h-3 w-3" />
                <span>สร้างเมื่อ {formatTime(queue.created_at)}</span>
              </div>
            </div>
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50"
                disabled={cancellingQueue === queue.id}
              >
                <X className="h-4 w-4 mr-1" />
                ยกเลิก
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  ยืนยันการยกเลิกคิว
                </AlertDialogTitle>
                <AlertDialogDescription>
                  คุณต้องการยกเลิกคิวหมายเลข <strong>{formatQueueNumber(queue.type, queue.number)}</strong> ใช่หรือไม่?
                  <br />
                  <span className="text-red-600 font-medium">การยกเลิกนี้ไม่สามารถย้อนกลับได้</span>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onCancelQueue(queue.id)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  ยืนยันยกเลิกคิว
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        
        {queue.notes && (
          <div className="mt-2 text-xs text-gray-600">
            <span className="font-medium">หมายเหตุ:</span> {queue.notes}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QueueCard;
