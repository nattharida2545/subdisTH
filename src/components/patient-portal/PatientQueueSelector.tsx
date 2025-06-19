
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, AlertCircle } from 'lucide-react';
import { Queue, Patient } from '@/integrations/supabase/schema';
import { formatQueueNumber } from '@/utils/queueFormatters';
import { useIsMobile } from '@/hooks/use-mobile';

interface PatientQueueSelectorProps {
  queues: Queue[];
  patients: Patient[];
  onSelectQueue: (queue: Queue) => void;
  onLogout: () => void;
}

const PatientQueueSelector: React.FC<PatientQueueSelectorProps> = ({
  queues,
  patients,
  onSelectQueue,
  onLogout
}) => {
  const isMobile = useIsMobile();

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient?.name || 'ไม่พบข้อมูลผู้ป่วย';
  };

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

  const getWaitTimeEstimate = (index: number) => {
    return (index + 1) * 5; // Rough estimate: 5 minutes per queue position
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('th-TH', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Sort queues by priority (PRIORITY first) and then by creation time
  const sortedQueues = [...queues].sort((a, b) => {
    if (a.type === 'PRIORITY' && b.type !== 'PRIORITY') return -1;
    if (a.type !== 'PRIORITY' && b.type === 'PRIORITY') return 1;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 p-2 sm:p-4">
      <div className="flex justify-between items-center mb-3 sm:mb-4">
        <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-pharmacy-700`}>
          เลือกคิวที่ต้องการติดตาม
        </h1>
        <Button variant="outline" size={isMobile ? "sm" : "default"} onClick={onLogout}>
          ออกจากระบบ
        </Button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
        <div className="flex items-center gap-2 mb-1">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-blue-800">คุณมีคิวรอหลายคิว</span>
        </div>
        <p className="text-sm text-blue-700">
          กรุณาเลือกคิวที่ต้องการติดตาม คิวที่มีสถานะ "ด่วน" จะแสดงด้านบนสุด
        </p>
      </div>

      <div className="space-y-3">
        {sortedQueues.map((queue, index) => {
          const patientName = getPatientName(queue.patient_id);
          const estimatedWait = getWaitTimeEstimate(index);
          const isPriority = queue.type === 'PRIORITY';

          return (
            <Card 
              key={queue.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                isPriority ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'
              }`}
              onClick={() => onSelectQueue(queue)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`text-2xl font-bold ${
                      isPriority ? 'text-red-600' : 'text-pharmacy-600'
                    }`}>
                      {formatQueueNumber(queue.type, queue.number)}
                    </div>
                    <Badge 
                      variant={isPriority ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      {getQueueTypeLabel(queue.type)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>~{estimatedWait} นาที</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800">{patientName}</span>
                    <Badge variant="outline" className="text-xs">
                      สถานะ: รอดำเนินการ
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>สร้างเมื่อ {formatTime(queue.created_at)}</span>
                    </div>
                    {queue.notes && (
                      <div className="flex-1 truncate">
                        <span>หมายเหตุ: {queue.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <Button 
                  className="w-full mt-3" 
                  size="sm"
                  variant={isPriority ? "destructive" : "default"}
                >
                  เลือกคิวนี้
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {queues.length === 0 && (
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-8 flex flex-col items-center justify-center">
            <p className="text-gray-500 text-center">ไม่พบคิวที่รอดำเนินการ</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PatientQueueSelector;
