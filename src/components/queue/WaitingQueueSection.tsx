
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Queue, Patient } from '@/integrations/supabase/schema';
import { formatQueueNumber } from '@/utils/queueFormatters';

interface WaitingQueueSectionProps {
  waitingQueues: Queue[];
  findPatient: (patientId: string) => Patient | undefined;
}

const WaitingQueueSection: React.FC<WaitingQueueSectionProps> = ({ 
  waitingQueues, 
  findPatient 
}) => {
  return (
    <div className="lg:col-span-3 space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">คิวถัดไป</h2>
      
      {waitingQueues.length === 0 ? (
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-6 flex items-center justify-center min-h-[200px]">
            <p className="text-gray-500">ไม่มีคิวที่รอดำเนินการ</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {waitingQueues.map((queue, index) => {
                const patient = findPatient(queue.patient_id);
                const patientName = patient ? patient.name : "ไม่พบข้อมูลผู้ป่วย";
                
                return (
                  <div 
                    key={queue.id} 
                    className={`p-4 flex items-center justify-between ${index === 0 ? 'bg-blue-50' : ''}`}
                  >
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                        index === 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {formatQueueNumber(queue.type, queue.number)}
                      </div>
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{patientName}</div>
                        <div className="text-xs text-gray-500">รอประมาณ {5 * (index + 1)} นาที</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WaitingQueueSection;
