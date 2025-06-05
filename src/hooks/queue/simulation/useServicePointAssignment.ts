
import { createLogger } from '@/utils/logger';

const logger = createLogger('useServicePointAssignment');

export const useServicePointAssignment = () => {
  const findServicePointForQueueType = (queueType: any, mappings: any[], enabledServicePoints: any[]) => {
    // Find service points that can handle this queue type using mappings
    const compatibleServicePoints = mappings
      .filter(mapping => mapping.queue_type_id === queueType.id)
      .map(mapping => enabledServicePoints.find(sp => sp.id === mapping.service_point_id))
      .filter(Boolean);

    if (compatibleServicePoints.length > 0) {
      // Use simple round-robin assignment
      const index = Math.floor(Math.random() * compatibleServicePoints.length);
      logger.debug(`Found ${compatibleServicePoints.length} compatible service points for ${queueType.code}, selecting:`, compatibleServicePoints[index]?.code);
      return compatibleServicePoints[index];
    }

    // Fallback: assign to first available service point
    logger.warn(`No compatible service points found for queue type ${queueType.code}, using fallback:`, enabledServicePoints[0]?.code);
    return enabledServicePoints[0];
  };

  return { findServicePointForQueueType };
};
