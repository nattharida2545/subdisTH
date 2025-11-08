
import * as React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent
} from '@/components/ui/chart';

interface WaitTimeChartProps {
  data: Array<{ time: string; waitTime: number; insWaitTime?: number }>;
  timeFrame: 'day' | 'week' | 'month';
}

const chartConfig = {
  waitTime: {
    label: "คิวรับยา",
    color: "hsl(217, 91%, 60%)",
  },
  insWaitTime: {
    label: "คิวตรวจ",
    color: "hsl(271, 91%, 65%)",
  },
}

const WaitTimeChart: React.FC<WaitTimeChartProps> = ({ data, timeFrame }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        ไม่มีข้อมูลเวลารอในช่วงเวลานี้
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
            label={{ value: 'นาที', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
          />
          <ChartTooltip 
            content={<ChartTooltipContent 
              labelFormatter={(value) => `เวลา: ${value}`}
            />} 
          />
          <Legend 
            wrapperStyle={{ paddingTop: '10px' }}
            iconType="line"
          />
          <Line 
            type="monotone" 
            dataKey="waitTime" 
            name={chartConfig.waitTime.label}
            stroke={chartConfig.waitTime.color}
            strokeWidth={2}
            dot={{ fill: chartConfig.waitTime.color, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
          <Line 
            type="monotone" 
            dataKey="insWaitTime" 
            name={chartConfig.insWaitTime.label}
            stroke={chartConfig.insWaitTime.color}
            strokeWidth={2}
            dot={{ fill: chartConfig.insWaitTime.color, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

export default WaitTimeChart;
