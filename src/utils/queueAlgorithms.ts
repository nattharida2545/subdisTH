import {
  QueueTypeEnum,
  QueueStatus,
  Queue as SchemaQueue,
} from "@/integrations/supabase/schema";
import { createLogger } from "@/utils/logger";

const logger = createLogger("QueueAlgorithms");

export enum QueueAlgorithmType {
  FIFO = "fifo",
  PRIORITY = "priority",
  MULTILEVEL = "multilevel",
  MULTILEVEL_FEEDBACK = "multilevel_feedback",
  ROUND_ROBIN = "round_robin",
}

export const QueueAlgorithmOptions = [
  {
    value: QueueAlgorithmType.FIFO,
    label: "First In, First Out (FIFO)",
    description: "ให้บริการตามลำดับการเข้ามา",
  },
  {
    value: QueueAlgorithmType.PRIORITY,
    label: "Priority Scheduling",
    description: "ให้บริการตามความสำคัญของคิว",
  },
  {
    value: QueueAlgorithmType.MULTILEVEL,
    label: "Multilevel Queue",
    description: "แบ่งคิวตามประเภทและให้บริการตามระดับความสำคัญ",
  },
  {
    value: QueueAlgorithmType.MULTILEVEL_FEEDBACK,
    label: "Multilevel Feedback Queue",
    description: "คิวหลายระดับที่ปรับเปลี่ยนตามเวลารอ",
  },
  {
    value: QueueAlgorithmType.ROUND_ROBIN,
    label: "Round Robin",
    description: "หมุนเวียนให้บริการทุกประเภทคิว",
  },
];

export const algorithmDescriptions = {
  [QueueAlgorithmType.FIFO]:
    "First In, First Out (FIFO): เรียกคิวตามลำดับที่มาก่อนมาก่อน",
  [QueueAlgorithmType.PRIORITY]:
    "Priority: เรียกคิวตามความสำคัญ โดยคิวที่มีระดับความสำคัญสูงกว่าจะถูกเรียกก่อน",
  [QueueAlgorithmType.MULTILEVEL]:
    "Multilevel Queue: แบ่งคิวเป็นระดับตามประเภทคิว แต่ละระดับมีลำดับความสำคัญต่างกัน",
  [QueueAlgorithmType.MULTILEVEL_FEEDBACK]:
    "Multilevel Feedback Queue: คล้ายกับ Multilevel แต่จะปรับระดับความสำคัญตามเวลารอ",
  [QueueAlgorithmType.ROUND_ROBIN]:
    "Round Robin: หมุนเวียนให้บริการทุกประเภทคิว เพื่อความเป็นธรรมในการรอคิว",
};

// Define the ServicePointCapability interface
export interface ServicePointCapability {
  servicePointId: string;
  queueTypeIds: string[];
}

// Define the QueueTypeWithAlgorithm interface
export interface QueueTypeWithAlgorithm {
  id: string;
  code: string;
  name: string;
  priority: number;
  algorithm?: QueueAlgorithmType;
  [key: string]: any; // Allow for other properties
}

// Use the Queue type from schema to ensure compatibility
export type Queue = SchemaQueue;

// Implement the sortQueuesByAlgorithm function
export const sortQueuesByAlgorithm = (
  queues: SchemaQueue[],
  queueTypes: QueueTypeWithAlgorithm[],
  algorithm: QueueAlgorithmType = QueueAlgorithmType.FIFO,
  servicePointCapabilities: ServicePointCapability[] = [],
  selectedServicePointId?: string
): SchemaQueue[] => {
  logger.debug("sortQueuesByAlgorithm called with:", {
    queuesCount: queues.length,
    algorithm,
    selectedServicePointId,
    servicePointCapabilities,
  });

  console.log("queueTypes:", queueTypes);
  // Filter queues by service point capabilities if specified
  let filteredQueues = [...queues];

  if (selectedServicePointId && servicePointCapabilities.length > 0) {
    // Find capabilities for the selected service point
    const capability = servicePointCapabilities.find(
      (cap) => cap.servicePointId === selectedServicePointId
    );

    logger.debug("Found capability for service point:", capability);

    // If we found capabilities and they have queue types
    if (capability && capability.queueTypeIds.length > 0) {
      // Filter queues to only include those with types the service point can handle
      filteredQueues = filteredQueues.filter((queue) => {
        // Find the queue type object for this queue
        const queueType = queueTypes.find((type) => type.code === queue.type);
        console.log("queueType in funtion:", queueType);
        const canHandle =
          queueType && capability.queueTypeIds.includes(queueType.id);

        logger.debug("Queue filtering:", {
          queueId: queue.id,
          queueNumber: queue.number,
          queueType: queue.type,
          queueTypeId: queueType?.id,
          canHandle,
          capabilityQueueTypeIds: capability.queueTypeIds,
        });

        return canHandle;
      });

      logger.debug("Filtered queues by service point capability:", {
        originalCount: queues.length,
        filteredCount: filteredQueues.length,
        servicePointId: selectedServicePointId,
      });
    } else {
      logger.warn(
        "No capabilities found for service point or no queue types configured:",
        selectedServicePointId
      );
    }
  } else {
    logger.debug(
      "No service point selected or no capabilities configured, showing all queues"
    );
  }

  // Create a map for quick lookup of queue type priorities
  const queueTypeMap = queueTypes.reduce<
    Record<string, QueueTypeWithAlgorithm>
  >((map, type) => {
    map[type.code] = type;
    return map;
  }, {});

  console.log("queueTypeMap", queueTypeMap);

  // Sort the queues based on the selected algorithm
  switch (algorithm) {
    case QueueAlgorithmType.FIFO:
      // Sort by creation time (oldest first)
      return filteredQueues.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

    case QueueAlgorithmType.PRIORITY:
      // Sort by priority (highest first), then by creation time
      return filteredQueues.sort((a, b) => {
        const typePriorityA = queueTypeMap[a.type]?.priority || 5;
        const typePriorityB = queueTypeMap[b.type]?.priority || 5;

        if (typePriorityA !== typePriorityB) {
          return typePriorityB - typePriorityA; // Higher priority first
        }

        // If priorities are the same, fall back to creation time
        return (
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      });

    case QueueAlgorithmType.MULTILEVEL:
      // Group by type, then sort by priority and time within each group
      const queuesByType: Record<string, Queue[]> = {};
      filteredQueues.forEach((queue) => {
        if (!queuesByType[queue.type]) {
          queuesByType[queue.type] = [];
        }
        queuesByType[queue.type].push(queue);
      });

      // Sort each type group by creation time
      Object.keys(queuesByType).forEach((type) => {
        queuesByType[type].sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      });

      // Flatten the groups, prioritizing by queue type priority
      const typesByPriority = Object.keys(queuesByType).sort((a, b) => {
        const priorityA = queueTypeMap[a]?.priority || 5;
        const priorityB = queueTypeMap[b]?.priority || 5;
        return priorityB - priorityA; // Higher priority first
      });

      return typesByPriority.flatMap((type) => queuesByType[type]);

    case QueueAlgorithmType.MULTILEVEL_FEEDBACK:
      // Similar to multilevel but adjust priority based on waiting time
      return filteredQueues.sort((a, b) => {
        let typePriorityA = queueTypeMap[a.type]?.priority || 5;
        let typePriorityB = queueTypeMap[b.type]?.priority || 5;

        // Calculate waiting time in minutes
        const waitTimeA =
          (Date.now() - new Date(a.created_at).getTime()) / (1000 * 60);
        const waitTimeB =
          (Date.now() - new Date(b.created_at).getTime()) / (1000 * 60);

        // Adjust priority based on waiting time (every 30 minutes increases priority by 1)
        typePriorityA += Math.floor(waitTimeA / 30);
        typePriorityB += Math.floor(waitTimeB / 30);

        if (typePriorityA !== typePriorityB) {
          return typePriorityB - typePriorityA; // Higher adjusted priority first
        }

        // If adjusted priorities are the same, fall back to creation time
        return (
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      });

    case QueueAlgorithmType.ROUND_ROBIN:
      // Group by type, then take the oldest from each type in round-robin fashion
      const typeGroups: Record<string, Queue[]> = {};
      filteredQueues.forEach((queue) => {
        if (!typeGroups[queue.type]) {
          typeGroups[queue.type] = [];
        }
        typeGroups[queue.type].push(queue);
      });

      // Sort each type group by creation time
      Object.keys(typeGroups).forEach((type) => {
        typeGroups[type].sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      });

      // Interleave the queues from each type
      const result: Queue[] = [];
      let hasMoreQueues = true;
      let index = 0;

      while (hasMoreQueues) {
        hasMoreQueues = false;

        for (const type of Object.keys(typeGroups)) {
          if (index < typeGroups[type].length) {
            result.push(typeGroups[type][index]);
            hasMoreQueues = true;
          }
        }

        index++;
      }

      return result;

    default:
      return filteredQueues;
  }
};
