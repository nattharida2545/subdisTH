import * as React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { Queue, QueueIns } from "@/integrations/supabase/schema";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { getQueueTypeLabel, getAllQueueTypes } from "@/utils/queueTypeUtils";

interface QueueCompositionChartProps {
  waitingQueues: Queue[];
  waitingInsQueues?: QueueIns[];
}

const chartConfig = {
  count: {
    label: "จำนวนคิว",
    color: "hsl(var(--chart-3))",
  },
};

const QueueCompositionChart: React.FC<QueueCompositionChartProps> = ({
  waitingQueues,
  waitingInsQueues = [],
}) => {
  const [hasData, SetHasData] = React.useState(false);
  const [data, setData] = React.useState([]);

  React.useEffect(() => {
    const getType = async () => {
      const data = (await getAllQueueTypes()).map((queueType) => {
        // รวมจำนวนคิวจากทั้ง Pharmacy Queue และ INS Queue
        const pharmacyCount = waitingQueues.filter(
          (q) => q.type === queueType.code
        ).length;
        const insCount = waitingInsQueues.filter(
          (q) => q.type === queueType.code
        ).length;
        const totalCount = pharmacyCount + insCount;
        
        return {
          type: queueType.name,
          count: totalCount,
        };
      });
      setData(data);
      const hasData = data.some((item) => item.count > 0);
      SetHasData(hasData);
    };
    getType();
  }, [waitingQueues, waitingInsQueues]);

  // Check if all counts are zero

  if (!hasData) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        ไม่มีคิวรอในขณะนี้
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 60, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            type="number"
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: "hsl(var(--muted-foreground))" }}
          />
          <YAxis
            dataKey="type"
            type="category"
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: "hsl(var(--muted-foreground))" }}
            width={50}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(value) => `ประเภท: ${value}`}
                formatter={(value, name) => [
                  `${value} `,
                  chartConfig.count.label,
                ]}
              />
            }
          />
          <Bar
            dataKey="count"
            fill="var(--color-count)"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default QueueCompositionChart;
