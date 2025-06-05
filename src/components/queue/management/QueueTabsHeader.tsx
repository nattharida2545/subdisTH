
import * as React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, CheckCircle, SkipForward, Pause } from 'lucide-react';
import { Queue } from '@/integrations/supabase/schema';

interface QueueTabsHeaderProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  waitingQueues: Queue[];
  activeQueues: Queue[];
  completedQueues: Queue[];
  skippedQueues: Queue[];
  pausedQueues: Queue[];
}

const QueueTabsHeader: React.FC<QueueTabsHeaderProps> = ({
  activeTab,
  onTabChange,
  waitingQueues,
  activeQueues,
  completedQueues,
  skippedQueues,
  pausedQueues
}) => {
  return (
    <div className="border-b bg-gray-50/50 px-6 py-3">
      <TabsList className="grid w-full grid-cols-5 bg-white shadow-sm">
        <TabsTrigger value="waiting" className="flex items-center gap-2 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700">
          <Clock className="w-4 h-4" />
          รอ
          <Badge variant="secondary" className="bg-orange-100 text-orange-700">
            {waitingQueues.length}
          </Badge>
        </TabsTrigger>
        
        <TabsTrigger value="active" className="flex items-center gap-2 data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
          <Users className="w-4 h-4" />
          กำลังบริการ
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            {activeQueues.length}
          </Badge>
        </TabsTrigger>
        
        <TabsTrigger value="skipped" className="flex items-center gap-2 data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700">
          <SkipForward className="w-4 h-4" />
          ข้าม
          <Badge variant="secondary" className="bg-amber-100 text-amber-700">
            {skippedQueues.length}
          </Badge>
        </TabsTrigger>

        <TabsTrigger value="completed" className="flex items-center gap-2 data-[state=active]:bg-gray-50 data-[state=active]:text-gray-700">
          <CheckCircle className="w-4 h-4" />
          เสร็จสิ้น
          <Badge variant="secondary" className="bg-gray-100 text-gray-700">
            {completedQueues.length}
          </Badge>
        </TabsTrigger>
      </TabsList>
    </div>
  );
};

export default QueueTabsHeader;
