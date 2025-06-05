
import React from 'react';
import { ServicePoint } from '@/integrations/supabase/schema';
import PharmacyQueuePanel from '@/components/test/PharmacyQueuePanel';

interface PharmacyQueueContentProps {
  selectedServicePoint: ServicePoint;
  refreshTrigger: number;
}

const PharmacyQueueContent: React.FC<PharmacyQueueContentProps> = ({
  selectedServicePoint,
  refreshTrigger
}) => {
  return (
    <div className="h-full p-6">
      <PharmacyQueuePanel
        servicePointId={selectedServicePoint.id}
        title={`บริการจ่ายยา - ${selectedServicePoint.name}`}
        refreshTrigger={refreshTrigger}
      />
    </div>
  );
};

export default PharmacyQueueContent;
