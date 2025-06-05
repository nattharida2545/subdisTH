
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PharmacyQueueTabs from './pharmacy-queue/PharmacyQueueTabs';

interface PharmacyQueuePanelProps {
  servicePointId?: string;
  title?: string;
  refreshTrigger: number;
}

const PharmacyQueuePanel: React.FC<PharmacyQueuePanelProps> = ({
  servicePointId,
  title = "คิวร้านยา",
  refreshTrigger
}) => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <PharmacyQueueTabs
          servicePointId={servicePointId}
          refreshTrigger={refreshTrigger}
        />
      </CardContent>
    </Card>
  );
};

export default PharmacyQueuePanel;
