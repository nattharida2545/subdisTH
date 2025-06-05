
import React from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useServicePoints } from '@/hooks/useServicePoints';
import { useQueues } from '@/hooks/useQueues';
import { usePatients } from '@/hooks/usePatients';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import QueueList from '@/components/queue/QueueList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ServicePointQueue = () => {
  const { servicePointId } = useParams<{ servicePointId: string }>();
  const { servicePoints } = useServicePoints();
  const { queues, updateQueueStatus, recallQueue } = useQueues();
  const { patients } = usePatients();

  // Find the service point
  const servicePoint = servicePoints.find(sp => sp.id === servicePointId);

  // Filter queues for this specific service point
  const servicePointQueues = queues.filter(q => q.service_point_id === servicePointId);
  
  const waitingQueues = servicePointQueues.filter(q => q.status === 'WAITING');
  const activeQueues = servicePointQueues.filter(q => q.status === 'ACTIVE');
  const completedQueues = servicePointQueues.filter(q => q.status === 'COMPLETED');

  // Get patient name by ID
  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? patient.name : 'Unknown';
  };

  if (!servicePoint) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">ไม่พบจุดบริการที่ระบุ</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout className="overflow-hidden">
      <div className="flex flex-col h-[calc(100vh-2rem)]">
        <div className="mb-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>{servicePoint.name}</span>
                <span className="text-sm text-gray-500">({servicePoint.code})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-orange-600">{waitingQueues.length}</p>
                  <p className="text-sm text-gray-500">รอดำเนินการ</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{activeQueues.length}</p>
                  <p className="text-sm text-gray-500">กำลังให้บริการ</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-600">{completedQueues.length}</p>
                  <p className="text-sm text-gray-500">เสร็จสิ้น</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="waiting" className="h-full flex flex-col">
            <div className="border-b px-2">
              <TabsList className="h-12">
                <TabsTrigger value="waiting" className="relative">
                  คิวที่รอดำเนินการ
                  {waitingQueues.length > 0 && (
                    <span className="ml-2 rounded-full bg-primary text-primary-foreground text-xs px-2 py-0.5">
                      {waitingQueues.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="active" className="relative">
                  กำลังให้บริการ
                  {activeQueues.length > 0 && (
                    <span className="ml-2 rounded-full bg-green-500 text-white text-xs px-2 py-0.5">
                      {activeQueues.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="completed">
                  เสร็จสิ้น
                  {completedQueues.length > 0 && (
                    <span className="ml-2 rounded-full bg-gray-500 text-white text-xs px-2 py-0.5">
                      {completedQueues.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="flex-1 overflow-auto p-2">
              <TabsContent value="waiting" className="mt-0 h-full">
                <Card className="h-full overflow-auto border-0 shadow-none">
                  <QueueList
                    queues={waitingQueues}
                    getPatientName={getPatientName}
                    onUpdateStatus={updateQueueStatus}
                    status="WAITING"
                    selectedServicePoint={servicePoint}
                  />
                </Card>
              </TabsContent>
              
              <TabsContent value="active" className="mt-0 h-full">
                <Card className="h-full overflow-auto border-0 shadow-none">
                  <QueueList
                    queues={activeQueues}
                    getPatientName={getPatientName}
                    onUpdateStatus={updateQueueStatus}
                    onRecallQueue={recallQueue}
                    status="ACTIVE"
                    selectedServicePoint={servicePoint}
                  />
                </Card>
              </TabsContent>
              
              <TabsContent value="completed" className="mt-0 h-full">
                <Card className="h-full overflow-auto border-0 shadow-none">
                  <QueueList
                    queues={completedQueues}
                    getPatientName={getPatientName}
                    status="COMPLETED"
                    selectedServicePoint={servicePoint}
                  />
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default ServicePointQueue;
