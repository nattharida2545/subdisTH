
import React from 'react';
import { Settings, Loader2 } from 'lucide-react';
import PharmacyQueuePanel from '@/components/test/PharmacyQueuePanel';
import ServicePointPanelControls from './ServicePointPanelControls';
import { ServicePoint } from '@/integrations/supabase/schema';

interface TestDashboardRightPanelProps {
  selectedServicePoints: string[];
  enabledServicePoints: ServicePoint[];
  refreshKey: number;
  onServicePointChange: (index: number, servicePointId: string) => void;
  loading?: boolean;
}

const TestDashboardRightPanel: React.FC<TestDashboardRightPanelProps> = ({
  selectedServicePoints,
  enabledServicePoints,
  refreshKey,
  onServicePointChange,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="w-1/2 flex flex-col">
        <div className="bg-gray-100 p-4 border-b flex-shrink-0">
          <h3 className="font-medium text-gray-900 mb-3">จุดบริการ</h3>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
            <span className="ml-2 text-gray-500">กำลังโหลดจุดบริการ...</span>
          </div>
        </div>
        <div className="flex-1 bg-gray-50" />
      </div>
    );
  }

  return (
    <div className="w-1/2 flex flex-col h-full">
      {/* Panel Controls */}
      <ServicePointPanelControls
        selectedServicePoints={selectedServicePoints}
        enabledServicePoints={enabledServicePoints}
        onServicePointChange={onServicePointChange}
      />

      {/* Service Point Panels - Fixed Height Container */}
      <div className="flex-1 flex flex-col min-h-0">
        {[0, 1, 2].map((index) => (
          <div 
            key={`panel-${index}`} 
            className="flex-1 border-b last:border-b-0 overflow-hidden min-h-0"
            style={{ height: 'calc(100% / 3)' }}
          >
            {selectedServicePoints[index] ? (
              <PharmacyQueuePanel 
                key={`panel-${index}-${selectedServicePoints[index]}-${refreshKey}`}
                servicePointId={selectedServicePoints[index]}
                title={`จุดบริการ ${index + 1}`}
                refreshTrigger={refreshKey}
              />
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-50">
                <div className="text-center text-gray-500">
                  <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">เลือกจุดบริการ</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestDashboardRightPanel;
