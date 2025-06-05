
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useServicePoints } from '@/hooks/useServicePoints';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useServicePointState');

export const useServicePointState = (forceRefresh: () => void) => {
  const { servicePoints, loading: servicePointsLoading } = useServicePoints();
  const [selectedServicePoints, setSelectedServicePoints] = useState<string[]>(['', '', '']);
  const [isInitialized, setIsInitialized] = useState(false);

  // Memoize enabled service points to prevent unnecessary re-renders
  const enabledServicePoints = useMemo(() => {
    const enabled = servicePoints.filter(sp => sp.enabled);
    logger.debug('Enabled service points:', enabled.length);
    return enabled;
  }, [servicePoints]);

  // Initialize service point selections with better loading state handling
  useEffect(() => {
    if (servicePointsLoading) {
      logger.debug('Service points still loading, waiting...');
      return;
    }

    if (enabledServicePoints.length === 0) {
      logger.warn('No enabled service points found');
      setIsInitialized(true);
      return;
    }

    if (!isInitialized) {
      logger.debug('Initializing service point selections...');
      
      const savedSelections = localStorage.getItem('test-dashboard-service-points');
      let newSelections: string[] = ['', '', ''];

      if (savedSelections) {
        try {
          const parsed = JSON.parse(savedSelections);
          if (Array.isArray(parsed) && parsed.length === 3) {
            // Validate that saved selections still exist in enabled service points
            newSelections = parsed.map(id => 
              enabledServicePoints.some(sp => sp.id === id) ? id : ''
            );
            logger.debug('Loaded and validated saved service point selections:', newSelections);
          }
        } catch (error) {
          logger.warn('Failed to parse saved service points:', error);
        }
      }

      // Auto-assign available service points to empty slots
      for (let i = 0; i < 3; i++) {
        if (!newSelections[i] && enabledServicePoints.length > 0) {
          // Find a service point that's not already selected
          const availableServicePoint = enabledServicePoints.find(
            sp => !newSelections.includes(sp.id)
          );
          if (availableServicePoint) {
            newSelections[i] = availableServicePoint.id;
          }
        }
      }

      logger.info('Final service point selections:', newSelections);
      setSelectedServicePoints(newSelections);
      localStorage.setItem('test-dashboard-service-points', JSON.stringify(newSelections));
      setIsInitialized(true);
    }
  }, [enabledServicePoints, isInitialized, servicePointsLoading]);

  // Handle service point changes with debounced refresh
  const handleServicePointChange = useCallback((index: number, servicePointId: string) => {
    logger.debug(`Changing service point ${index} to:`, servicePointId);
    
    setSelectedServicePoints(prev => {
      const updated = [...prev];
      updated[index] = servicePointId;
      
      localStorage.setItem('test-dashboard-service-points', JSON.stringify(updated));
      logger.debug(`Updated service point selections:`, updated);
      
      return updated;
    });

    // Debounced refresh to prevent rapid fire updates
    setTimeout(() => {
      logger.debug('Triggering refresh after service point change');
      forceRefresh();
    }, 200);
  }, [forceRefresh]);

  return {
    selectedServicePoints,
    enabledServicePoints,
    handleServicePointChange,
    isInitialized: isInitialized && !servicePointsLoading,
    loading: servicePointsLoading || !isInitialized
  };
};
