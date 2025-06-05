
import { useState, useCallback } from 'react';
import { useQueues } from '@/hooks/useQueues';
import { useGlobalRealtime } from '@/hooks/useGlobalRealtime';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useTestDashboardState');

export const useTestDashboardState = () => {
  const { fetchQueues } = useQueues();
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());

  // Optimized refresh function with debouncing
  const forceRefresh = useCallback(() => {
    const now = Date.now();
    
    // Prevent rapid successive refreshes (debounce 300ms)
    if (now - lastRefreshTime < 300) {
      logger.debug('Skipping refresh due to debouncing');
      return;
    }
    
    logger.debug('Forcing refresh of all components');
    setLastRefreshTime(now);
    setRefreshKey(prev => {
      const newKey = prev + 1;
      logger.debug('New refresh key:', newKey);
      return newKey;
    });
    
    // Fetch queues with a small delay to ensure state updates are processed
    setTimeout(() => {
      fetchQueues(true); // Force refresh
    }, 100);
  }, [fetchQueues, lastRefreshTime]);

  // Use global realtime manager instead of individual subscription
  useGlobalRealtime(
    'test-dashboard-realtime',
    useCallback(() => {
      logger.debug('Queue change detected via global realtime, refreshing dashboard');
      forceRefresh();
    }, [forceRefresh]),
    undefined,
    true
  );

  return {
    refreshKey,
    forceRefresh
  };
};
