
import * as React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent
} from '@/components/ui/chart';

interface ThroughputChartProps {
  data: Array<{ time: string; count: number }>;
  timeFrame: 'day' | 'week' | 'month';
}

const ThroughputChart: React.FC<ThroughputChartProps> = ({ data, timeFrame }) => {
  return (
    <div className="h-80">
      <ChartContainer config={{}}>
        <BarChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="time" 
            label={{ value: timeFrame === 'day' ? 'เวลา' : 'วันที่', position: 'insideBottom', offset: -5 }} 
          />
          <YAxis label={{ value: 'จำนวนผู้รับบริการ', angle: -90, position: 'insideLeft' }} />
          <ChartTooltip content={<ChartTooltipContent labelFormatter={(value) => `เวลา: ${value}`} />} />
          <Legend />
          <Bar dataKey="count" name="จำนวนผู้รับบริการ" fill="#10b981" barSize={30} />
        </BarChart>
      </ChartContainer>
    </div>
  );
};

export default ThroughputChart;
