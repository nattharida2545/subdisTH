
import React from 'react';
import TestDashboardLeftPanel from './TestDashboardLeftPanel';
import TestDashboardRightPanel from './TestDashboardRightPanel';
import { ServicePoint } from '@/integrations/supabase/schema';

interface TestDashboardLayoutProps {
  refreshKey: number;
  selectedServicePoints: string[];
  enabledServicePoints: ServicePoint[];
  onServicePointChange: (index: number, servicePointId: string) => void;
  servicePointLoading: boolean;
}

const TestDashboardLayout: React.FC<TestDashboardLayoutProps> = ({
  refreshKey,
  selectedServicePoints,
  enabledServicePoints,
  onServicePointChange,
  servicePointLoading
}) => {
  return (
    <div className="flex-1 flex overflow-hidden min-h-0">
      {/* Left Side - Queue Management & Board */}
      <TestDashboardLeftPanel refreshKey={refreshKey} />

      {/* Right Side - Service Point Panels */}
      <TestDashboardRightPanel
        selectedServicePoints={selectedServicePoints}
        enabledServicePoints={enabledServicePoints}
        refreshKey={refreshKey}
        onServicePointChange={onServicePointChange}
        loading={servicePointLoading}
      />
    </div>
  );
};

export default TestDashboardLayout;
