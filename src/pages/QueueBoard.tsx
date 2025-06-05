
import React, { useEffect, useState, useRef } from 'react';
import QueueBoardContainer from '@/components/queue/board/QueueBoardContainer';
import { supabase } from '@/integrations/supabase/client';
import { announceQueue } from '@/utils/textToSpeech';
import { getServicePointById } from '@/utils/servicePointUtils';
import { Queue } from '@/integrations/supabase/schema';

const QueueBoard = () => {
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const connectionTestTimerRef = useRef<NodeJS.Timeout | null>(null);
  const connectionTestCountRef = useRef(0);
  const maxConnectionAttempts = 3;
  const requestsInProgressRef = useRef<Set<string>>(new Set());
  const requestQueueRef = useRef<Array<() => Promise<void>>>([]);
  const maxConcurrentRequests = 2;

  // Function to manage request queue
  const processRequestQueue = async () => {
    if (requestQueueRef.current.length === 0) return;
    
    // If we're already at max concurrent requests, don't start more
    if (requestsInProgressRef.current.size >= maxConcurrentRequests) return;
    
    // Get the next request from the queue
    const nextRequest = requestQueueRef.current.shift();
    if (!nextRequest) return;
    
    // Add a unique ID to track this request
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    requestsInProgressRef.current.add(requestId);
    
    try {
      await nextRequest();
    } catch (error) {
      console.error('Error processing queued request:', error);
    } finally {
      // Remove this request from the in-progress set
      requestsInProgressRef.current.delete(requestId);
      // Process the next request in the queue
      processRequestQueue();
    }
  };

  // Function to add a request to the queue
  const queueRequest = (requestFn: () => Promise<void>) => {
    requestQueueRef.current.push(requestFn);
    processRequestQueue();
  };

  useEffect(() => {
    // Set up real-time subscription to queue changes
    const channel = supabase
      .channel('queue-board-changes')
      .on('postgres_changes', 
          { event: 'UPDATE', schema: 'public', table: 'queues' },
          async (payload) => {
            console.log('Queue update received:', payload);
            
            // Check if a queue was just set to ACTIVE (meaning it was called)
            if (payload.new && payload.new.status === 'ACTIVE') {
              const queue = payload.new as Queue;
              
              console.log('Announcing queue:', queue.number, 'at service point:', queue.service_point_id);
              
              // Announce the queue with proper service point information
              try {
                // Get service point information if available
                const servicePointInfo = queue.service_point_id 
                  ? await getServicePointById(queue.service_point_id)
                  : null;
                
                announceQueue(
                  queue.number,
                  servicePointInfo || { code: '', name: 'ช่องบริการ หนึ่ง' },
                  queue.type
                );
              } catch (error) {
                console.error("Error announcing queue:", error);
              }
            }
          }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to queue changes');
          setConnectionError(null);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to queue changes');
          setConnectionError('Failed to connect to Supabase realtime. Please check your internet connection.');
        }
      });
      
    // Test the Supabase connection once, with limited retries
    const testConnection = async () => {
      try {
        // Increment the connection attempt counter
        connectionTestCountRef.current += 1;
        
        // Only attempt up to max connection attempts
        if (connectionTestCountRef.current > maxConnectionAttempts) {
          console.log(`Reached maximum connection test attempts (${maxConnectionAttempts})`);
          return;
        }
        
        console.log(`Testing Supabase connection (attempt ${connectionTestCountRef.current}/${maxConnectionAttempts})...`);
        
        // Queue the connection test request
        queueRequest(async () => {
          try {
            const { error } = await supabase.from('queues').select('count').limit(1);
            if (error) {
              console.error('Supabase connection test failed:', error);
              setConnectionError(`Failed to connect to Supabase: ${error.message}`);
              
              // Schedule a retry after 5 seconds if we haven't reached max attempts
              if (connectionTestCountRef.current < maxConnectionAttempts) {
                connectionTestTimerRef.current = setTimeout(testConnection, 5000);
              }
            } else {
              console.log('Supabase connection test successful');
              setConnectionError(null);
              connectionTestCountRef.current = 0; // Reset counter on success
            }
          } catch (err) {
            console.error('Supabase connection test exception:', err);
            setConnectionError(`Connection error: ${err instanceof Error ? err.message : String(err)}`);
            
            // Schedule a retry after 5 seconds if we haven't reached max attempts
            if (connectionTestCountRef.current < maxConnectionAttempts) {
              connectionTestTimerRef.current = setTimeout(testConnection, 5000);
            }
          }
        });
      } catch (err) {
        console.error('Error queueing connection test:', err);
      }
    };
    
    // Run the connection test once
    testConnection();
      
    return () => {
      console.log('Cleaning up Supabase channel');
      supabase.removeChannel(channel);
      
      // Clear any pending connection test timer
      if (connectionTestTimerRef.current) {
        clearTimeout(connectionTestTimerRef.current);
      }
    };
  }, []);

  // Expose the request queue function to the window for other components to use
  useEffect(() => {
    // @ts-expect-error Adding custom property to window object
    window.queueSupabaseRequest = queueRequest;
    
    return () => {
      // @ts-expect-error Removing custom property from window object
      delete window.queueSupabaseRequest;
    };
  }, []);

  return (
    <>
      {connectionError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded fixed top-0 left-0 right-0 z-50">
          <p><strong>Connection Error:</strong> {connectionError}</p>
          <p>Please check your internet connection and refresh the page.</p>
        </div>
      )}
      <QueueBoardContainer />
    </>
  );
};

export default QueueBoard;
