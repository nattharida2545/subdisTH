
import * as React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { createLogger } from '@/utils/logger';

const logger = createLogger('PharmacyRealtime');

export interface PharmacyRealtimeConfig {
  onQueueChange: () => void;
  enabled?: boolean;
  debounceMs?: number;
}

export const usePharmacyRealtime = ({
  onQueueChange,
  enabled = true,
  debounceMs = 500
}: PharmacyRealtimeConfig) => {
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  const debouncedOnChange = React.useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      onQueueChange();
    }, debounceMs);
  }, [onQueueChange, debounceMs]);

  React.useEffect(() => {
    if (!enabled) return;

    logger.debug('Setting up pharmacy realtime subscription');

    const channel = supabase
      .channel('pharmacy-realtime-updates')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'queues' },
          () => {
            logger.debug('Queue change detected');
            debouncedOnChange();
          }
      )
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'pharmacy_queue_services' },
          () => {
            logger.debug('Pharmacy service change detected');
            debouncedOnChange();
          }
      )
      .subscribe();
      
    return () => {
      logger.debug('Cleaning up pharmacy realtime subscription');
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      supabase.removeChannel(channel);
    };
  }, [enabled, debouncedOnChange]);

  return {
    // No return values needed for this hook
  };
};
