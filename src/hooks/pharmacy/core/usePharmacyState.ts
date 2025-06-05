
import * as React from 'react';
import { PharmacyQueue } from '../types';

export interface PharmacyState {
  queues: PharmacyQueue[];
  activeQueue: PharmacyQueue | null;
  loading: boolean;
}

export const usePharmacyState = () => {
  const [state, setState] = React.useState<PharmacyState>({
    queues: [],
    activeQueue: null,
    loading: true
  });

  const setQueues = React.useCallback((queues: PharmacyQueue[]) => {
    setState(prev => ({ ...prev, queues }));
  }, []);

  const setActiveQueue = React.useCallback((activeQueue: PharmacyQueue | null) => {
    setState(prev => ({ ...prev, activeQueue }));
  }, []);

  const setLoading = React.useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const updateQueueInState = React.useCallback((updatedQueue: PharmacyQueue) => {
    setState(prev => ({
      ...prev,
      queues: prev.queues.map(queue => 
        queue.id === updatedQueue.id ? updatedQueue : queue
      )
    }));
  }, []);

  const removeQueueFromState = React.useCallback((queueId: string) => {
    setState(prev => ({
      ...prev,
      queues: prev.queues.filter(queue => queue.id !== queueId),
      activeQueue: prev.activeQueue?.id === queueId ? null : prev.activeQueue
    }));
  }, []);

  return {
    ...state,
    setQueues,
    setActiveQueue,
    setLoading,
    updateQueueInState,
    removeQueueFromState
  };
};
