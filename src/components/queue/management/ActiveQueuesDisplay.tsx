
import React from 'react';
import { Queue, ServicePoint } from '@/integrations/supabase/schema';
import ActiveQueueSection from '@/components/queue/ActiveQueueSection';

interface ActiveQueuesDisplayProps {
  activeQueues: Queue[];
  findPatient: (patientId: string) => any;
  findServicePoint: (servicePointId: string | null) => ServicePoint | null;
}

const ActiveQueuesDisplay: React.FC<ActiveQueuesDisplayProps> = ({ 
  activeQueues, 
  findPatient, 
  findServicePoint 
}) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">กำลังให้บริการ</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeQueues.length === 0 ? (
          <p className="text-gray-500 p-6 bg-gray-50 rounded-lg border border-gray-100">
            ไม่มีคิวที่กำลังให้บริการในขณะนี้
          </p>
        ) : (
          activeQueues.map(queue => (
            <ActiveQueueSection
              key={queue.id}
              activeQueues={[queue]}
              findPatient={findPatient}
              findServicePoint={findServicePoint}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ActiveQueuesDisplay;
