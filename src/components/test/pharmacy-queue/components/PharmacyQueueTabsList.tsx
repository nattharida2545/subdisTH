
import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, Users, Pause, SkipForward } from 'lucide-react';

interface QueuesByUIStatus {
  waiting: any[];
  active: any[];
  paused: any[];
  skipped: any[];
  completed: any[];
}

interface PharmacyQueueTabsListProps {
  queuesByStatus: QueuesByUIStatus;
}

const PharmacyQueueTabsList: React.FC<PharmacyQueueTabsListProps> = ({
  queuesByStatus
}) => {
  return (
    <TabsList className="grid w-full grid-cols-5">
      <TabsTrigger value="waiting" className="flex items-center gap-2">
        <Clock className="w-4 h-4" />
        รอ
        <Badge variant="secondary">{queuesByStatus.waiting.length}</Badge>
      </TabsTrigger>
      <TabsTrigger value="active" className="flex items-center gap-2">
        <Users className="w-4 h-4" />
        กำลังบริการ
        <Badge variant="secondary">{queuesByStatus.active.length}</Badge>
      </TabsTrigger>
      <TabsTrigger value="paused" className="flex items-center gap-2">
        <Pause className="w-4 h-4" />
        พัก
        <Badge variant="secondary">{queuesByStatus.paused.length}</Badge>
      </TabsTrigger>
      <TabsTrigger value="skipped" className="flex items-center gap-2">
        <SkipForward className="w-4 h-4" />
        ข้าม
        <Badge variant="secondary">{queuesByStatus.skipped.length}</Badge>
      </TabsTrigger>
      <TabsTrigger value="completed" className="flex items-center gap-2">
        <CheckCircle className="w-4 h-4" />
        เสร็จสิ้น
        <Badge variant="secondary">{queuesByStatus.completed.length}</Badge>
      </TabsTrigger>
    </TabsList>
  );
};

export default PharmacyQueueTabsList;
