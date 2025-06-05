
import React, { useState, useCallback } from 'react';
import { useServicePointContext } from '@/contexts/ServicePointContext';
import { MedicationsProvider } from '@/components/medications/context/MedicationsContext';
import PharmacyQueueHeader from '@/components/pharmacy-queue/PharmacyQueueHeader';
import PharmacyQueueEmptyState from '@/components/pharmacy-queue/PharmacyQueueEmptyState';
import PharmacyQueueContent from '@/components/pharmacy-queue/PharmacyQueueContent';
import PharmacyQueueLoading from '@/components/pharmacy-queue/PharmacyQueueLoading';

const PharmacyQueue = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const { 
    selectedServicePoint,
    setSelectedServicePoint,
    servicePoints,
    loading: loadingServicePoints
  } = useServicePointContext();

  const handleServicePointChange = (value: string) => {
    const servicePoint = servicePoints.find(sp => sp.id === value);
    if (servicePoint) {
      setSelectedServicePoint(servicePoint);
    }
  };

  const handleManualRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  if (loadingServicePoints) {
    return <PharmacyQueueLoading />;
  }

  return (
    <MedicationsProvider>
      <div className="flex flex-col h-screen overflow-hidden">
        <div className="p-6 border-b bg-white">
          <PharmacyQueueHeader
            selectedServicePoint={selectedServicePoint}
            servicePoints={servicePoints}
            onServicePointChange={handleServicePointChange}
            onRefresh={handleManualRefresh}
          />
        </div>

        <div className="flex-1 overflow-hidden">
          {!selectedServicePoint ? (
            <PharmacyQueueEmptyState />
          ) : (
            <PharmacyQueueContent
              selectedServicePoint={selectedServicePoint}
              refreshTrigger={refreshTrigger}
            />
          )}
        </div>
      </div>
    </MedicationsProvider>
  );
};

export default PharmacyQueue;
