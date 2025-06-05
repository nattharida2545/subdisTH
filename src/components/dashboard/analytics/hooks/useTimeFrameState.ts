
import * as React from 'react';

export type TimeFrame = 'day' | 'week' | 'month';

export const useTimeFrameState = () => {
  const [timeFrame, setTimeFrame] = React.useState<TimeFrame>('day');
  
  return {
    timeFrame,
    setTimeFrame
  };
};
