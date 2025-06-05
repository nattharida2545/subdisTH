
import React from 'react';
import QueueManagementContainer from '@/components/queue/management/QueueManagementContainer';
import QueueBoardContainer from '@/components/queue/board/QueueBoardContainer';

interface TestDashboardLeftPanelProps {
  refreshKey: number;
}

const TestDashboardLeftPanel: React.FC<TestDashboardLeftPanelProps> = ({
  refreshKey
}) => {
  return (
    <div className="w-1/2 flex flex-col border-r bg-white">
      {/* Queue Management */}
      <div className="h-1/2 border-b overflow-hidden">
        <div className="h-full overflow-auto">
          <QueueManagementContainer key={`mgmt-${refreshKey}`} />
        </div>
      </div>
      
      {/* Queue Board */}
      <div className="h-1/2 overflow-hidden">
        <div className="h-full overflow-auto">
          <QueueBoardContainer key={`board-${refreshKey}`} />
        </div>
      </div>
    </div>
  );
};

export default TestDashboardLeftPanel;
