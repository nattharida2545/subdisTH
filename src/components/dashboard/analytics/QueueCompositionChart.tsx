
import * as React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Queue } from '@/integrations/supabase/schema';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent
} from '@/components/ui/chart';

interface QueueCompositionChartProps {
  waitingQueues: Queue[];
}

const QueueCompositionChart: React.FC<QueueCompositionChartProps> = ({ waitingQueues }) => {
  // Count the queues by type using the actual data
  const generalCount = waitingQueues.filter(q => q.type === 'GENERAL').length;
  const elderlyCount = waitingQueues.filter(q => q.type === 'ELDERLY').length;
  const priorityCount = waitingQueues.filter(q => q.type === 'PRIORITY').length;
  const followUpCount = waitingQueues.filter(q => q.type === 'FOLLOW_UP').length;

  const data = [
    { type: 'ทั่วไป', count: generalCount },
    { type: 'ผู้สูงอายุ', count: elderlyCount },
    { type: 'เร่งด่วน', count: priorityCount },
    { type: 'ยาพิเศษ', count: followUpCount },
  ];

  return (
    <div className="h-80">
      <ChartContainer config={{}}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          layout="vertical"
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="type" type="category" />
          <ChartTooltip content={<ChartTooltipContent labelFormatter={(value) => `ประเภท: ${value}`} />} />
          <Legend />
          <Bar dataKey="count" name="จำนวนคิว" fill="#8884d8" />
        </BarChart>
      </ChartContainer>
    </div>
  );
};

export default QueueCompositionChart;
