
import * as React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent
} from '@/components/ui/chart';

interface ThroughputChartProps {
  data: Array<{ time: string; count: number; insCount?: number }>;
  timeFrame: 'day' | 'week' | 'month';
}

const chartConfig = {
  count: {
    label: "คิวรับยา",
    color: "hsl(217, 91%, 60%)",
  },
  insCount: {
    label: "คิวตรวจ",
    color: "hsl(271, 91%, 65%)",
  },
}

const ThroughputChart: React.FC<ThroughputChartProps> = ({ data, timeFrame }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        ไม่มีข้อมูลผู้รับบริการในช่วงเวลานี้
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
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
            label={{ value: 'คน', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
          />
          <ChartTooltip 
            content={<ChartTooltipContent 
              labelFormatter={(value) => `เวลา: ${value}`}
            />} 
          />
          <Legend 
            wrapperStyle={{ paddingTop: '10px' }}
          />
          <Bar 
            dataKey="count" 
            name={chartConfig.count.label}
            fill={chartConfig.count.color}
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="insCount" 
            name={chartConfig.insCount.label}
            fill={chartConfig.insCount.color}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

export default ThroughputChart;
