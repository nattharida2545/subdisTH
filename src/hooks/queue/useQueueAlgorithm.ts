
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
        const { data, error } = await supabase
          .from('settings')
          .select('value')
          .eq('category', 'queue')
          .eq('key', 'queue_algorithm')
          .maybeSingle();
          
        if (error) {
          logger.error('Error fetching queue algorithm from database:', error);
          // Fall back to localStorage
          const savedAlgorithm = localStorage.getItem('queue_algorithm') as QueueAlgorithmType | null;
          if (savedAlgorithm && Object.values(QueueAlgorithmType).includes(savedAlgorithm)) {
            setQueueAlgorithm(savedAlgorithm);
          }
          return;
        }
        
        if (data?.value) {
          let algorithm: QueueAlgorithmType;
          
          // Handle both string and object values properly
          if (typeof data.value === 'string') {
            // Normalize the string to lowercase for comparison
            const normalizedValue = data.value.toLowerCase();
            algorithm = normalizedValue as QueueAlgorithmType;
          } else if (typeof data.value === 'object' && data.value !== null) {
            // If it's an object, try to extract the algorithm value
            const valueObj = data.value as any;
            const extractedValue = valueObj.algorithm || valueObj.value || 'fifo';
            algorithm = extractedValue.toLowerCase() as QueueAlgorithmType;
          } else {
            // Fallback to FIFO if we can't determine the value
            algorithm = QueueAlgorithmType.FIFO;
          }
          
          // Validate that the algorithm is a valid enum value (case-insensitive)
          const validAlgorithms = Object.values(QueueAlgorithmType);
          const isValid = validAlgorithms.includes(algorithm);
          
          if (isValid) {
            setQueueAlgorithm(algorithm);
            localStorage.setItem('queue_algorithm', algorithm);
            logger.info('Successfully loaded queue algorithm:', algorithm);
          } else {
            logger.warn('Invalid algorithm value from database, using default FIFO:', data.value);
            setQueueAlgorithm(QueueAlgorithmType.FIFO);
            localStorage.setItem('queue_algorithm', QueueAlgorithmType.FIFO);
          }
        } else {
          // No data found, use default FIFO algorithm
          logger.info('No queue algorithm setting found, using default FIFO');
          setQueueAlgorithm(QueueAlgorithmType.FIFO);
          localStorage.setItem('queue_algorithm', QueueAlgorithmType.FIFO);
        }
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
