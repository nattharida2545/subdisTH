
import React, { useMemo } from 'react';
import TestDashboardHeader from '@/components/test-dashboard/TestDashboardHeader';
import TestDashboardLayout from '@/components/test-dashboard/TestDashboardLayout';
import { useTestDashboardActions } from '@/components/test-dashboard/hooks/useTestDashboardActions';
import { useTestDashboardState } from '@/components/test-dashboard/hooks/useTestDashboardState';
import { useServicePointState } from '@/components/test-dashboard/hooks/useServicePointState';

const TestDashboard = () => {
  const { refreshKey, forceRefresh } = useTestDashboardState();

  // Custom hooks for actions and state management
  const { handleSimulate, handleRecalculate, handleClearQueues } = useTestDashboardActions(forceRefresh);
  const { 
    selectedServicePoints, 
    enabledServicePoints, 
    handleServicePointChange,
    loading: servicePointLoading
  } = useServicePointState(forceRefresh);

  // Memoize props to prevent unnecessary re-renders
  const headerProps = useMemo(() => ({
    onSimulate: handleSimulate,
    onRecalculate: handleRecalculate,
    onClearQueues: handleClearQueues,
    onForceRefresh: forceRefresh
  }), [handleSimulate, handleRecalculate, handleClearQueues, forceRefresh]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      {/* Header */}
      <TestDashboardHeader {...headerProps} />

      {/* Main Content */}
      <TestDashboardLayout
        refreshKey={refreshKey}
        selectedServicePoints={selectedServicePoints}
        enabledServicePoints={enabledServicePoints}
        onServicePointChange={handleServicePointChange}
        servicePointLoading={servicePointLoading}
      />
    </div>
  );
};

export default TestDashboard;
