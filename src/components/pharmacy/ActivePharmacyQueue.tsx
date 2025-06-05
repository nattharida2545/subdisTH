
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PharmacyQueue } from '@/hooks/usePharmacyQueue';
import { ServicePoint } from '@/integrations/supabase/schema';
import { formatThaiDateTime } from '@/utils/dateUtils';
import QueueTypeLabel from '@/components/queue/QueueTypeLabel';

interface ActivePharmacyQueueProps {
  queue: PharmacyQueue;
  servicePoint?: ServicePoint | null;
}

const ActivePharmacyQueue: React.FC<ActivePharmacyQueueProps> = ({ queue, servicePoint }) => {
  const patient = queue.patient;
  
  return (
    <Card className="bg-white border-2 border-pharmacy-200">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-shrink-0 text-center">
            <div className="text-sm font-medium text-pharmacy-700 mb-1">กำลังให้บริการคิว</div>
            <div className="text-4xl md:text-5xl font-bold text-pharmacy-600">{queue.number}</div>
            <div className="mt-1">
              <QueueTypeLabel queueType={queue.type as any} />
            </div>
            {servicePoint && (
              <div className="mt-2">
                <Badge variant="outline" className="bg-gray-50">
                  {servicePoint.name}
                </Badge>
              </div>
            )}
          </div>
          
          <div className="flex-grow md:border-l md:pl-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-gray-500">ชื่อผู้รับบริการ</div>
                <div className="font-medium text-lg">{patient?.name || 'ไม่พบข้อมูล'}</div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-500">รหัสผู้ป่วย</div>
                <div className="font-medium">{patient?.patient_id || '-'}</div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-500">เบอร์โทรศัพท์</div>
                <div className="font-medium">{patient?.phone || '-'}</div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-500">เวลาที่เรียก</div>
                <div className="font-medium">{queue.called_at ? formatThaiDateTime(queue.called_at) : '-'}</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivePharmacyQueue;
