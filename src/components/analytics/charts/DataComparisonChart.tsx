import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartConfig,
} from "@/components/ui/chart";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Clock,
  Users,
  Activity,
} from "lucide-react";

interface DataComparisonChartProps {
  realData: {
    avgWaitTime: number;
    completedQueues: number;
    throughput: number;
    label: string;
  };
  simulationData: {
    avgWaitTime: number;
    completedQueues: number;
    throughput: number;
    label: string;
  };
  isSimulationMode: boolean;
}

const DataComparisonChart: React.FC<DataComparisonChartProps> = ({
  realData,
  simulationData,
  isSimulationMode,
}) => {
  // Use fallback data when real data is missing
  const effectiveRealData =
    realData.completedQueues > 0
      ? realData
      : {
          avgWaitTime: 8,
          completedQueues: 15,
          throughput: 3,
          label: "ข้อมูลจริง (ตัวอย่าง)",
        };

  const chartData = [
    {
      name: "เวลารอเฉลี่ย (นาที)",
      real: effectiveRealData.avgWaitTime,
      simulation: simulationData.avgWaitTime,
      unit: "นาที",
    },
    {
      name: "คิวที่เสร็จ",
      real: effectiveRealData.completedQueues,
      simulation: simulationData.completedQueues,
      unit: "คิว",
    },
    {
      name: "ประสิทธิภาพ",
      real: effectiveRealData.throughput,
      simulation: simulationData.throughput,
      unit: "คิว/รอบ",
    },
  ];

  const getComparisonInsight = () => {
    const waitTimeDiff =
      simulationData.avgWaitTime - effectiveRealData.avgWaitTime;
    const throughputDiff =
      simulationData.throughput - effectiveRealData.throughput;

    if (Math.abs(waitTimeDiff) < 2 && Math.abs(throughputDiff) < 2) {
      return {
        status: "similar",
        message: "ข้อมูลจำลองใกล้เคียงกับข้อมูลจริง",
        icon: Activity,
      };
    } else if (waitTimeDiff < 0 && throughputDiff > 0) {
      return {
        status: "better",
        message: "การจำลองแสดงประสิทธิภาพที่ดีกว่าข้อมูลจริง",
        icon: TrendingUp,
      };
    } else {
      return {
        status: "different",
        message: "การจำลองมีผลลัพธ์แตกต่างจากข้อมูลจริง",
        icon: TrendingDown,
      };
    }
  };

  const insight = getComparisonInsight();
  const InsightIcon = insight.icon;

  const chartConfig: ChartConfig = {
    real: {
      label: "ข้อมูลจริง",
      color: "hsl(var(--primary))",
    },
    simulation: {
      label: "ข้อมูลจำลอง",
      color: "hsl(var(--secondary))",
    },
  };

  // return (
  //   // <Card className="mb-6">
  //   //   <CardHeader>
  //   //     <CardTitle className="flex items-center gap-2">
  //   //       <BarChart3 className="h-5 w-5" />
  //   //       เปรียบเทียบข้อมูลจริง vs ข้อมูลจำลอง
  //   //       {isSimulationMode && (
  //   //         <Badge variant="outline" className="border-blue-300 bg-blue-100 text-blue-700">
  //   //           🔬 ข้อมูลจำลองพร้อมใช้งาน
  //   //         </Badge>
  //   //       )}
  //   //     </CardTitle>
  //   //     <p className="text-sm text-muted-foreground">
  //   //       เปรียบเทียบประสิทธิภาพระหว่างข้อมูลจริงและการจำลองเพื่อวิเคราะห์ความแม่นยำ
  //   //     </p>
  //   //   </CardHeader>
  //   //   <CardContent className="space-y-6">
  //   //     {/* Performance Metrics Cards */}
  //   //     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  //   //       <Card className="border-blue-200 bg-blue-50">
  //   //         <CardContent className="p-4">
  //   //           <div className="flex items-center justify-between">
  //   //             <div>
  //   //               <p className="text-sm font-medium text-blue-900">เวลารอเฉลี่ย</p>
  //   //               <p className="text-lg font-bold text-blue-600">
  //   //                 {effectiveRealData.label}: {effectiveRealData.avgWaitTime} นาที
  //   //               </p>
  //   //               <p className="text-lg font-bold text-blue-800">
  //   //                 จำลอง: {simulationData.avgWaitTime} นาที
  //   //               </p>
  //   //               {realData.completedQueues === 0 && (
  //   //                 <p className="text-xs text-blue-500 italic">*ใช้ข้อมูลตัวอย่าง</p>
  //   //               )}
  //   //             </div>
  //   //             <Clock className="h-8 w-8 text-blue-400" />
  //   //           </div>
  //   //         </CardContent>
  //   //       </Card>

  //   //       <Card className="border-green-200 bg-green-50">
  //   //         <CardContent className="p-4">
  //   //           <div className="flex items-center justify-between">
  //   //             <div>
  //   //               <p className="text-sm font-medium text-green-900">คิวที่เสร็จ</p>
  //   //               <p className="text-lg font-bold text-green-600">
  //   //                 {effectiveRealData.label}: {effectiveRealData.completedQueues}
  //   //               </p>
  //   //               <p className="text-lg font-bold text-green-800">
  //   //                 จำลอง: {simulationData.completedQueues}
  //   //               </p>
  //   //             </div>
  //   //             <Users className="h-8 w-8 text-green-400" />
  //   //           </div>
  //   //         </CardContent>
  //   //       </Card>

  //   //       <Card className="border-orange-200 bg-orange-50">
  //   //         <CardContent className="p-4">
  //   //           <div className="flex items-center justify-between">
  //   //             <div>
  //   //               <p className="text-sm font-medium text-orange-900">ประสิทธิภาพ</p>
  //   //               <p className="text-lg font-bold text-orange-600">
  //   //                 {effectiveRealData.label}: {effectiveRealData.throughput}
  //   //               </p>
  //   //               <p className="text-lg font-bold text-orange-800">
  //   //                 จำลอง: {simulationData.throughput}
  //   //               </p>
  //   //             </div>
  //   //             <Activity className="h-8 w-8 text-orange-400" />
  //   //           </div>
  //   //         </CardContent>
  //   //       </Card>
  //   //     </div>

  //   //     {/* Comparison Chart */}
  //   //     <div className="bg-white p-4 rounded-lg border">
  //   //       <h4 className="font-medium mb-4">เปรียบเทียบทางกราฟ</h4>
  //   //       <ChartContainer config={chartConfig} className="h-[300px]">
  //   //         <BarChart data={chartData}>
  //   //           <CartesianGrid strokeDasharray="3 3" />
  //   //           <XAxis dataKey="name" />
  //   //           <YAxis />
  //   //           <ChartTooltip
  //   //             content={<ChartTooltipContent
  //   //               formatter={(value, name) => [
  //   //                 `${value} ${chartData.find(d => d.real === value || d.simulation === value)?.unit || ''}`,
  //   //                 name === 'real' ? 'ข้อมูลจริง' : 'ข้อมูลจำลอง'
  //   //               ]}
  //   //             />}
  //   //           />
  //   //           <ChartLegend content={<ChartLegendContent />} />
  //   //           <Bar dataKey="real" fill="var(--color-real)" name="real" />
  //   //           <Bar dataKey="simulation" fill="var(--color-simulation)" name="simulation" />
  //   //         </BarChart>
  //   //       </ChartContainer>
  //   //     </div>

  //   //     {/* Analysis Insights */}
  //   //     <div className={`p-4 rounded-lg border ${
  //   //       insight.status === 'better' ? 'border-green-200 bg-green-50' :
  //   //       insight.status === 'similar' ? 'border-blue-200 bg-blue-50' :
  //   //       'border-amber-200 bg-amber-50'
  //   //     }`}>
  //   //       <div className="flex items-center gap-2 mb-2">
  //   //         <InsightIcon className={`h-4 w-4 ${
  //   //           insight.status === 'better' ? 'text-green-600' :
  //   //           insight.status === 'similar' ? 'text-blue-600' :
  //   //           'text-amber-600'
  //   //         }`} />
  //   //         <h5 className={`font-medium ${
  //   //           insight.status === 'better' ? 'text-green-800' :
  //   //           insight.status === 'similar' ? 'text-blue-800' :
  //   //           'text-amber-800'
  //   //         }`}>
  //   //           การวิเคราะห์เปรียบเทียบ
  //   //         </h5>
  //   //       </div>
  //   //       <p className={`text-sm ${
  //   //         insight.status === 'better' ? 'text-green-700' :
  //   //         insight.status === 'similar' ? 'text-blue-700' :
  //   //         'text-amber-700'
  //   //       }`}>
  //   //         {insight.message}
  //   //       </p>

  //   //       {/* Detailed Comparison */}
  //   //         <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
  //   //           <div className="bg-white p-2 rounded border">
  //   //             <div className="font-medium">เวลารอ</div>
  //   //             <div>ผลต่าง: {Math.abs(simulationData.avgWaitTime - effectiveRealData.avgWaitTime)} นาที</div>
  //   //           </div>
  //   //           <div className="bg-white p-2 rounded border">
  //   //             <div className="font-medium">คิวที่เสร็จ</div>
  //   //             <div>ผลต่าง: {Math.abs(simulationData.completedQueues - effectiveRealData.completedQueues)} คิว</div>
  //   //           </div>
  //   //           <div className="bg-white p-2 rounded border">
  //   //             <div className="font-medium">ประสิทธิภาพ</div>
  //   //             <div>ผลต่าง: {Math.abs(simulationData.throughput - effectiveRealData.throughput)} คิว/รอบ</div>
  //   //           </div>
  //   //         </div>
  //   //     </div>
  //   //   </CardContent>
  //   // </Card>
  // );
};

export default DataComparisonChart;
