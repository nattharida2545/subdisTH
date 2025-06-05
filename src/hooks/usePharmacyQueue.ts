
import * as React from 'react';
import { usePharmacyQueueFetch } from './pharmacy/core/usePharmacyQueueFetch';
import { usePharmacyQueueActions } from './pharmacy/usePharmacyQueueActions';
import { usePharmacyServiceActions } from './pharmacy/usePharmacyServiceActions';
import { PharmacyQueue, PharmacyService } from './pharmacy/core/types';

// Re-export enhanced types
export type { PharmacyQueue, PharmacyService };

export const usePharmacyQueue = () => {
  // Get queue state and fetch functionality using new architecture
  const {
    queues,
    activeQueue,
    setActiveQueue,
    loading,
    error: fetchError,
    fetchPharmacyQueues
  } = usePharmacyQueueFetch();
  
  // Get queue actions (callNextQueue)
  const {
    loadingNext,
    error: queueActionError,
    callNextQueue
  } = usePharmacyQueueActions({
    activeQueue,
    setActiveQueue,
    fetchPharmacyQueues
  });
  
  // Get service actions (complete, forward)
  const {
    error: serviceActionError,
    completeService,
    forwardService
  } = usePharmacyServiceActions({
    activeQueue,
    setActiveQueue,
    fetchPharmacyQueues
  });
  
  // Combine errors using the new error handling system
  const error = React.useMemo(() => 
    fetchError || queueActionError || serviceActionError, 
    [fetchError, queueActionError, serviceActionError]
  );

  return {
    queues,
    activeQueue,
    loading,
    loadingNext,
    error,
    fetchPharmacyQueues,
    callNextQueue,
    completeService,
    forwardService
  };
};
