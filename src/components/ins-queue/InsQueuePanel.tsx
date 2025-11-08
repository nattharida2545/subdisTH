import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import InsQueueTabs from './tabs/InsQueueTabs';

interface InsQueuePanelProps {
  servicePointId?: string;
  title?: string;
  refreshTrigger: number;
}

const InsQueuePanel: React.FC<InsQueuePanelProps> = ({
  servicePointId,
  title = "คิวตรวจสอบสิทธิ์",
  refreshTrigger
}) => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <InsQueueTabs
          servicePointId={servicePointId}
          refreshTrigger={refreshTrigger}
        />
      </CardContent>
    </Card>
  );
};

export default InsQueuePanel;
