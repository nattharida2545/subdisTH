import * as React from "react";
import { QueueAlgorithmType } from "@/utils/queueAlgorithms";
import { useSettingsContext } from "@/contexts/SettingsContext";

export const useAlgorithmState = (
  urgentCount: number,
  elderlyCount: number,
  waitingQueueCount: number
) => {
  // Always define state hooks first
  const [currentAlgorithm, setCurrentAlgorithm] =
    React.useState<QueueAlgorithmType>(
      (localStorage.getItem("queue_algorithm") as QueueAlgorithmType) ||
        QueueAlgorithmType.FIFO
    );
  const [recommendedAlgorithm, setRecommendedAlgorithm] =
    React.useState<QueueAlgorithmType>(currentAlgorithm);
  const [shouldChangeAlgorithm, setShouldChangeAlgorithm] =
    React.useState(false);

  // Define callbacks with useCallback before useEffect
  const handleChangeAlgorithm = React.useCallback(() => {
    localStorage.setItem("queue_algorithm", recommendedAlgorithm);
    setCurrentAlgorithm(recommendedAlgorithm);
    setShouldChangeAlgorithm(false);
  }, [recommendedAlgorithm]);

  // useEffect should always be at the end
  React.useEffect(() => {
    let recommended = QueueAlgorithmType.FIFO;
    let shouldChange = false;

    // Avoid division by zero errors
    if (waitingQueueCount === 0) {
      setRecommendedAlgorithm(recommended);
      setShouldChangeAlgorithm(false);
      return;
    }

    const urgentPercentage = (urgentCount / waitingQueueCount) * 100;
    const elderlyPercentage = (elderlyCount / waitingQueueCount) * 100;

    // If there are many urgent cases (Priority queues), prioritize them
    if (urgentCount >= 3 || urgentPercentage > 20) {
      recommended = QueueAlgorithmType.PRIORITY;
      shouldChange = currentAlgorithm !== QueueAlgorithmType.PRIORITY;
    }
    // If there's a significant mix of elderly and regular, use multilevel
    else if (elderlyCount >= 2 || elderlyPercentage > 15) {
      recommended = QueueAlgorithmType.MULTILEVEL;
      shouldChange = currentAlgorithm !== QueueAlgorithmType.MULTILEVEL;
    }
    // For larger queues with diverse types, suggest multilevel feedback
    else if (waitingQueueCount > 15) {
      recommended = QueueAlgorithmType.MULTILEVEL_FEEDBACK;
      shouldChange =
        currentAlgorithm !== QueueAlgorithmType.MULTILEVEL_FEEDBACK;
    }

    setRecommendedAlgorithm(recommended);
    setShouldChangeAlgorithm(shouldChange);
  }, [urgentCount, elderlyCount, waitingQueueCount, currentAlgorithm]);

  return {
    currentAlgorithm,
    recommendedAlgorithm,
    shouldChangeAlgorithm,
    handleChangeAlgorithm,
  };
};
