
// Re-export the refactored hook for backward compatibility
export { useServicePointQueueTypes } from './service-point-queue-types';
export type { UseServicePointQueueTypesReturn } from './service-point-queue-types';

// New hook to get ALL service point queue type mappings
export { useAllServicePointQueueTypes } from './service-point-queue-types/useAllServicePointQueueTypes';
