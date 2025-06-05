
import { supabase } from '@/integrations/supabase/client';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useQueueNumbers');

export const useQueueNumbers = () => {
  const getNextQueueNumbers = async (enabledQueueTypes: any[]) => {
    const queueNumbers: Record<string, number> = {};
    
    for (const queueType of enabledQueueTypes) {
      try {
        const { data: lastQueue } = await supabase
          .from('queues')
          .select('number')
          .eq('type', queueType.code)
          .eq('queue_date', new Date().toISOString().split('T')[0])
          .order('number', { ascending: false })
          .limit(1)
          .maybeSingle();

        queueNumbers[queueType.code] = (lastQueue?.number || 0) + 1;
        logger.debug(`Next queue number for ${queueType.code}: ${queueNumbers[queueType.code]}`);
      } catch (error) {
        logger.warn(`Error getting last queue number for ${queueType.code}:`, error);
        queueNumbers[queueType.code] = 1; // Default to 1 if error
      }
    }

    return queueNumbers;
  };

  return { getNextQueueNumbers };
};
