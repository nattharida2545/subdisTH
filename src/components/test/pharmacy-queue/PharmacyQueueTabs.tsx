
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { usePharmacyQueueData } from './usePharmacyQueueData';
import PharmacyQueueTabContent from './components/PharmacyQueueTabContent';

interface PharmacyQueueTabsProps {
  servicePointId?: string;
  refreshTrigger: number;
}

const PharmacyQueueTabs: React.FC<PharmacyQueueTabsProps> = ({
  servicePointId = '',
  refreshTrigger
}) => {
  const {
    queuesByStatus,
    getPatientName,
    handleCallQueue,
    handleUpdateStatus,
    handleRecallQueue,
    handleHoldQueue,
    handleTransferQueue,
    handleReturnToWaiting,
    handleCancelQueue
  } = usePharmacyQueueData({ 
    servicePointId: servicePointId || '', 
    refreshTrigger 
  });

  const handleViewPatientInfo = (queue: any) => {
    console.log('View patient info for queue:', queue);
  };

  const handleTransferClick = (queueId: string) => {
    console.log('Transfer queue:', queueId);
  };

  return (
    <div className="h-full">
      <Tabs defaultValue="waiting" className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-5 mb-4">
          <TabsTrigger value="waiting" className="flex items-center gap-2">
            รอดำเนินการ
            {queuesByStatus.waiting.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {queuesByStatus.waiting.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="active" className="flex items-center gap-2">
            กำลังให้บริการ
            {queuesByStatus.active.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {queuesByStatus.active.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="paused" className="flex items-center gap-2">
            พัก
            {queuesByStatus.paused.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {queuesByStatus.paused.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="skipped" className="flex items-center gap-2">
            ข้าม
            {queuesByStatus.skipped.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {queuesByStatus.skipped.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            เสร็จสิ้น
            {queuesByStatus.completed.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {queuesByStatus.completed.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden">
          <PharmacyQueueTabContent
            value="waiting"
            queues={queuesByStatus.waiting}
            emptyMessage="ไม่มีคิวที่รอดำเนินการ"
            getPatientName={getPatientName}
            onViewPatientInfo={handleViewPatientInfo}
            onCallQueue={handleCallQueue}
            onUpdateStatus={handleUpdateStatus}
          />

          <PharmacyQueueTabContent
            value="active"
            queues={queuesByStatus.active}
            emptyMessage="ไม่มีคิวที่กำลังให้บริการ"
            getPatientName={getPatientName}
            onViewPatientInfo={handleViewPatientInfo}
            onUpdateStatus={handleUpdateStatus}
            onRecallQueue={handleRecallQueue}
            onHoldQueue={handleHoldQueue}
            onTransferClick={handleTransferClick}
          />

          <PharmacyQueueTabContent
            value="paused"
            queues={queuesByStatus.paused}
            emptyMessage="ไม่มีคิวที่พัก"
            getPatientName={getPatientName}
            onViewPatientInfo={handleViewPatientInfo}
            onCallQueue={handleCallQueue}
            onReturnToWaiting={handleReturnToWaiting}
          />

          <PharmacyQueueTabContent
            value="skipped"
            queues={queuesByStatus.skipped}
            emptyMessage="ไม่มีคิวที่ถูกข้าม"
            getPatientName={getPatientName}
            onViewPatientInfo={handleViewPatientInfo}
            onReturnToWaiting={handleReturnToWaiting}
            onCancelQueue={handleCancelQueue}
          />

          <PharmacyQueueTabContent
            value="completed"
            queues={queuesByStatus.completed}
            emptyMessage="ไม่มีคิวที่เสร็จสิ้น"
            getPatientName={getPatientName}
            onViewPatientInfo={handleViewPatientInfo}
            isCompleted={true}
          />
        </div>
      </Tabs>
    </div>
  );
};

export default PharmacyQueueTabs;
