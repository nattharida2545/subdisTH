
import * as React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent
} from '@/components/ui/chart';

interface WaitTimeChartProps {
  data: Array<{ time: string; waitTime: number }>;
  timeFrame: 'day' | 'week' | 'month';
}

const WaitTimeChart: React.FC<WaitTimeChartProps> = ({ data, timeFrame }) => {
  return (
    <div className="h-80">
      <ChartContainer config={{}}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="time" 
            label={{ value: timeFrame === 'day' ? 'เวลา' : 'วันที่', position: 'insideBottom', offset: -5 }} 
          />
          <YAxis label={{ value: 'เวลารอ (นาที)', angle: -90, position: 'insideLeft' }} />
          <ChartTooltip content={<ChartTooltipContent labelFormatter={(value) => `เวลา: ${value}`} />} />
          <Legend />
          <Line type="monotone" dataKey="waitTime" name="เวลารอ (นาที)" stroke="#3b82f6" strokeWidth={2} />
        </LineChart>
      </ChartContainer>
    </div>
  );
};

export default WaitTimeChart;
