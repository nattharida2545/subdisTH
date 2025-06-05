
import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useQueueRealtime');

interface UseQueueRealtimeOptions {
  onQueueChange?: () => void;
  servicePointId?: string;
  channelName?: string;
  enabled?: boolean;
  debounceMs?: number;
}

export const useQueueRealtime = (options: UseQueueRealtimeOptions = {}) => {
  const { 
    onQueueChange, 
    servicePointId, 
    channelName = 'queue-realtime', 
    enabled = true,
    debounceMs = 500
  } = options;
  
  const channelRef = useRef<any>(null);
  const onQueueChangeRef = useRef(onQueueChange);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update the callback ref when it changes
  useEffect(() => {
    onQueueChangeRef.current = onQueueChange;
  }, [onQueueChange]);

  // Debounced callback to prevent rapid fire updates
  const debouncedQueueChange = useCallback((payload: any) => {
    logger.debug(`Queue change detected on channel ${channelName}:`, payload);
    
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Set new timeout
    debounceTimeoutRef.current = setTimeout(() => {
      if (onQueueChangeRef.current) {
        logger.debug(`Executing debounced queue change for channel ${channelName}`);
        onQueueChangeRef.current();
      }
    }, debounceMs);
  }, [channelName, debounceMs]);

  useEffect(() => {
    if (!enabled) {
      logger.debug(`Real-time subscription disabled for channel: ${channelName}`);
      return;
    }

    // Clean up existing channel
    if (channelRef.current) {
      logger.debug(`Cleaning up existing channel: ${channelName}`);
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    logger.debug(`Setting up real-time subscription for channel: ${channelName}`);
    
    let channel = supabase.channel(channelName);

    // Set up queue change listener
    if (servicePointId) {
      // Listen for changes specific to a service point
      channel = channel.on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'queues',
          filter: `service_point_id=eq.${servicePointId}`
        },
        debouncedQueueChange
      );
      logger.debug(`Subscribed to queue changes for service point: ${servicePointId}`);
    } else {
      // Listen for all queue changes
      channel = channel.on('postgres_changes', 
        { event: '*', schema: 'public', table: 'queues' },
        debouncedQueueChange
      );
      logger.debug('Subscribed to all queue changes');
    }

    // Subscribe to the channel
    channel.subscribe((status) => {
      logger.debug(`Channel ${channelName} subscription status:`, status);
      if (status === 'SUBSCRIBED') {
        logger.info(`Successfully subscribed to channel: ${channelName}`);
      } else if (status === 'CHANNEL_ERROR') {
        logger.error(`Channel error for ${channelName}`);
      }
    });

    channelRef.current = channel;

    return () => {
      // Clear debounce timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = null;
      }
      
      if (channelRef.current) {
        logger.debug(`Cleaning up real-time subscription for channel: ${channelName}`);
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [servicePointId, channelName, enabled, debouncedQueueChange]);

  const cleanup = useCallback(() => {
    // Clear debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
    
    if (channelRef.current) {
      logger.debug(`Manual cleanup for channel: ${channelName}`);
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, [channelName]);

  return {
    cleanup
  };
};
