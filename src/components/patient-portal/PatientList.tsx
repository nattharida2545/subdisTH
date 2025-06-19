
import React from 'react';
import { Patient, Queue } from '@/integrations/supabase/schema';
import PatientCard from './PatientCard';
import QueueCard from './QueueCard';
import { Card, CardContent } from '@/components/ui/card';
import { Clock } from 'lucide-react';

interface PatientListProps {
  patients: Patient[];
  selectedPatient: Patient | null;
  patientQueues: Record<string, Queue[]>;
  loading: boolean;
  cancellingQueue: string | null;
  onSelectPatient: (patient: Patient) => void;
  onCancelQueue: (queueId: string) => void;
}

const PatientList: React.FC<PatientListProps> = ({
  patients,
  selectedPatient,
  patientQueues,
  loading,
  cancellingQueue,
  onSelectPatient,
  onCancelQueue
}) => {
  if (patients.length === 0) {
    return (
      <p className="text-center text-gray-500 py-4">ไม่พบข้อมูลผู้ป่วย</p>
    );
  }

  return (
    <div className="grid gap-3">
      {patients.map(patient => {
        const queues = patientQueues[patient.id] || [];
        const isSelected = selectedPatient?.id === patient.id;
        
        return (
          <div key={patient.id} className="space-y-2">
            <PatientCard
              patient={patient}
              queues={queues}
              isSelected={isSelected}
              isLoading={loading}
              onSelectPatient={onSelectPatient}
            />
            
            {/* Show queues for selected patient */}
            {isSelected && queues.length > 0 && (
              <div className="ml-4 space-y-2">
                {queues.map(queue => (
                  <QueueCard
                    key={queue.id}
                    queue={queue}
                    onCancelQueue={onCancelQueue}
                    cancellingQueue={cancellingQueue}
                  />
                ))}
              </div>
            )}
            
            {/* Show message for selected patient with no queues */}
            {isSelected && queues.length === 0 && !loading && (
              <div className="ml-4">
                <Card className="border-gray-200">
                  <CardContent className="p-3 text-center text-gray-500">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">ไม่มีคิวที่รอดำเนินการสำหรับผู้ป่วยรายนี้</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PatientList;
