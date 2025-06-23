
import * as React from 'react';
import { QueueAlgorithmType, QueueTypeWithAlgorithm, ServicePointCapability, sortQueuesByAlgorithm } from '@/utils/queueAlgorithms';
import { supabase } from '@/integrations/supabase/client';
import { createLogger } from '@/utils/logger';
import { Queue } from '@/integrations/supabase/schema';

const logger = createLogger('useQueueAlgorithm');

export const useQueueAlgorithm = () => {
  // Load algorithm and queue types from localStorage and Supabase
  const [queueAlgorithm, setQueueAlgorithm] = React.useState<QueueAlgorithmType>(QueueAlgorithmType.FIFO);
  const [queueTypes, setQueueTypes] = React.useState<QueueTypeWithAlgorithm[]>([]);
  
  React.useEffect(() => {
    logger.info('Loading queue algorithm and types');
    
    // Load algorithm from settings
    const fetchQueueAlgorithm = async () => {
      try {
        // Try to fetch from queue category first
        const { data: queueData, error: queueError } = await supabase
          .from('settings')
          .select('value')
          .eq('category', 'queue')
          .eq('key', 'queue_algorithm')
          .maybeSingle();
          
        let algorithm: QueueAlgorithmType = QueueAlgorithmType.FIFO;
        
        if (!queueError && queueData?.value) {
          // Handle value as string (since we now store it as string in JSONB)
          const rawValue = queueData.value;
          const stringValue = typeof rawValue === 'string' ? rawValue : String(rawValue);
          
          // Validate that the algorithm is a valid enum value
          const validAlgorithms = Object.values(QueueAlgorithmType);
          if (validAlgorithms.includes(stringValue as QueueAlgorithmType)) {
            algorithm = stringValue as QueueAlgorithmType;
            logger.info('Successfully loaded queue algorithm from queue category:', algorithm);
          } else {
            logger.warn('Invalid algorithm value from queue category, using default FIFO:', stringValue);
          }
        } else {
          // Fallback to general category
          logger.info('No queue algorithm in queue category, checking general category');
          const { data: generalData, error: generalError } = await supabase
            .from('settings')
            .select('value')
            .eq('category', 'general')
            .eq('key', 'queue_algorithm')
            .maybeSingle();
            
          if (!generalError && generalData?.value) {
            const rawValue = generalData.value;
            const stringValue = typeof rawValue === 'string' ? rawValue : String(rawValue);
            
            const validAlgorithms = Object.values(QueueAlgorithmType);
            if (validAlgorithms.includes(stringValue as QueueAlgorithmType)) {
              algorithm = stringValue as QueueAlgorithmType;
              logger.info('Successfully loaded queue algorithm from general category:', algorithm);
            } else {
              logger.warn('Invalid algorithm value from general category, using default FIFO:', stringValue);
            }
          }
        }
        
        setQueueAlgorithm(algorithm);
        localStorage.setItem('queue_algorithm', algorithm);
      } catch (err) {
        logger.error('Error in fetchQueueAlgorithm:', err);
        // Fall back to localStorage
        const savedAlgorithm = localStorage.getItem('queue_algorithm') as QueueAlgorithmType | null;
        if (savedAlgorithm && Object.values(QueueAlgorithmType).includes(savedAlgorithm)) {
          setQueueAlgorithm(savedAlgorithm);
        } else {
          setQueueAlgorithm(QueueAlgorithmType.FIFO);
        }
      }
    };
    
    // Load queue types from settings
    const fetchQueueTypes = async () => {
      try {
        const { data, error } = await supabase
          .from('queue_types')
          .select('*')
          .eq('enabled', true);
          
        if (error) {
          logger.error('Error fetching queue types from database:', error);
          // Fall back to localStorage
          const savedQueueTypes = localStorage.getItem('queue_types');
          if (savedQueueTypes) {
            try {
              const parsedQueueTypes = JSON.parse(savedQueueTypes);
              setQueueTypes(parsedQueueTypes);
            } catch (error) {
              logger.error('Error parsing queue types from localStorage:', error);
            }
          }
          return;
        }
        
        if (data && data.length > 0) {
          setQueueTypes(data as QueueTypeWithAlgorithm[]);
          // Update localStorage as well
          localStorage.setItem('queue_types', JSON.stringify(data));
          logger.info('Successfully loaded queue types:', data.length);
        } else {
          // No queue types found, log warning
          logger.warn('No enabled queue types found in database');
          setQueueTypes([]);
        }
      } catch (err) {
        logger.error('Error in fetchQueueTypes:', err);
        // Fall back to localStorage
        const savedQueueTypes = localStorage.getItem('queue_types');
        if (savedQueueTypes) {
          try {
            const parsedQueueTypes = JSON.parse(savedQueueTypes);
            setQueueTypes(parsedQueueTypes);
          } catch (error) {
            logger.error('Error parsing queue types from localStorage:', error);
          }
        }
      }
    };
    
    fetchQueueAlgorithm();
    fetchQueueTypes();

    // Set up real-time subscription for settings changes
    const settingsChannel = supabase
      .channel('settings-changes')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'settings' },
          (payload: any) => {
            logger.debug('Settings change detected:', payload);
            if (payload.new?.key === 'queue_algorithm') {
              fetchQueueAlgorithm();
            }
          }
      )
      .subscribe();

    // Set up real-time subscription for queue types changes  
    const queueTypesChannel = supabase
      .channel('queue-types-changes')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'queue_types' },
          (payload: any) => {
            logger.debug('Queue types change detected:', payload);
            fetchQueueTypes();
          }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(settingsChannel);
      supabase.removeChannel(queueTypesChannel);
    };
  }, []);
  
  // Memoize the sortQueues function to prevent infinite re-renders
  const sortQueues = React.useCallback((
    queuesToSort: Queue[],
    servicePointCapabilities: ServicePointCapability[] = [],
    selectedServicePointId?: string
  ): Queue[] => {
    logger.debug('Sorting queues with algorithm:', queueAlgorithm, 'for service point:', selectedServicePointId);
    logger.debug('Service point capabilities:', servicePointCapabilities);
    logger.debug('Queue types available:', queueTypes);
    
    const result = sortQueuesByAlgorithm(
      queuesToSort, 
      queueTypes, 
      queueAlgorithm, 
      servicePointCapabilities,
      selectedServicePointId
    ) as Queue[];
    
    logger.debug('Sorted queues result:', result);
    return result;
  }, [queueAlgorithm, queueTypes]); // Stable dependencies

  return {
    queueAlgorithm,
    setQueueAlgorithm,
    queueTypes,
    sortQueues
  };
};
