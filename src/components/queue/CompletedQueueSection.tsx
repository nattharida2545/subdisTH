
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Queue, Patient } from '@/integrations/supabase/schema';
import { formatQueueNumber } from '@/utils/queueFormatters';

interface CompletedQueueSectionProps {
  completedQueues: Queue[];
  findPatient: (patientId: string) => Patient | undefined;
}

const CompletedQueueSection: React.FC<CompletedQueueSectionProps> = ({ 
  completedQueues, 
  findPatient 
}) => {
  return (
    <div className="lg:col-span-3 space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">คิวที่เสร็จสิ้น</h2>
      
      <Card className="bg-white border border-gray-200">
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100">
            {completedQueues.length === 0 ? (
              <div className="p-6 flex items-center justify-center min-h-[200px]">
                <p className="text-gray-500">ยังไม่มีคิวที่เสร็จสิ้น</p>
              </div>
            ) : (
              completedQueues.map(queue => {
                const patient = findPatient(queue.patient_id);
                const patientName = patient ? patient.name : "ไม่พบข้อมูลผู้ป่วย";
                
                return (
                  <div key={queue.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center mr-3">
                        {formatQueueNumber(queue.type, queue.number)}
                      </div>
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{patientName}</div>
                        <div className="text-xs text-gray-500">เสร็จสิ้นเมื่อ {
                          queue.completed_at && new Date(queue.completed_at).toLocaleTimeString('th-TH', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                          })
                        }</div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompletedQueueSection;
