
import * as React from 'react';
import { DirectionProvider } from '@radix-ui/react-direction';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TabSelectorProps {
  timeFrame: 'day' | 'week' | 'month';
  setTimeFrame: (value: 'day' | 'week' | 'month') => void;
}

const TabSelector: React.FC<TabSelectorProps> = ({ timeFrame, setTimeFrame }) => {
  return (
    <div className="flex justify-end mb-2">
      <DirectionProvider dir="ltr">
        <Tabs value={timeFrame} onValueChange={(value) => setTimeFrame(value as 'day' | 'week' | 'month')}>
          <TabsList>
            <TabsTrigger 
              value="day" 
              className={timeFrame === 'day' ? 'bg-blue-100' : ''}
            >
              วันนี้
            </TabsTrigger>
            <TabsTrigger 
              value="week" 
              className={timeFrame === 'week' ? 'bg-blue-100' : ''}
            >
              7 วัน
            </TabsTrigger>
            <TabsTrigger 
              value="month" 
              className={timeFrame === 'month' ? 'bg-blue-100' : ''}
            >
              30 วัน
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </DirectionProvider>
    </div>
  );
};

export default TabSelector;
