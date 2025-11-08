import React, { useState, useCallback } from "react";
import { useServicePointIns } from "@/hooks/useServicePointIns";
import { InsQueueProvider } from "@/components/ins-queue/context/InsQueueContext";
import InsQueueHeader from "@/components/ins-queue/InsQueueHeader";
import InsQueueEmptyState from "@/components/ins-queue/InsQueueEmptyState";
import InsQueueContent from "@/components/ins-queue/InsQueueContent";
import InsQueueLoading from "@/components/ins-queue/InsQueueLoading";

const InsQueue = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const {
    selectedServicePoint,
    setSelectedServicePoint,
    servicePoints,
    loading: loadingServicePoints,
  } = useServicePointIns();

  const handleServicePointChange = (value: string) => {
    const servicePoint = servicePoints.find((sp) => sp.id === value);
    if (servicePoint) {
      setSelectedServicePoint(servicePoint);
    }
  };

  const handleManualRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  if (loadingServicePoints) {
    return <InsQueueLoading />;
  }

  return (
    <InsQueueProvider>
      <div className="flex flex-col h-screen overflow-hidden">
        <div className="p-6 border-b bg-white">
          <InsQueueHeader
            selectedServicePoint={selectedServicePoint}
            servicePoints={servicePoints}
            onServicePointChange={handleServicePointChange}
            onRefresh={handleManualRefresh}
          />
        </div>

        <div className="flex-1 overflow-hidden min-h-0">
          {!selectedServicePoint ? (
            <InsQueueEmptyState />
          ) : (
            <InsQueueContent
              selectedServicePoint={selectedServicePoint}
              refreshTrigger={refreshTrigger}
            />
          )}
        </div>
      </div>
    </InsQueueProvider>
  );
};

export default InsQueue;