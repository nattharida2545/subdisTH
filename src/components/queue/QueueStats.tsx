import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, List, Users, BarChart4, Pill, Stethoscope } from "lucide-react";
import { QueueIns } from "@/integrations/supabase/schema";
import { format } from "date-fns";
import { th } from "date-fns/locale";

interface QueueStatCardProps {
  title: string;
  subtitle?: string;
  value: string | number;
  icon: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  isSimulation?: boolean;
}

const QueueStatCard: React.FC<QueueStatCardProps> = ({
  title,
  subtitle,
  value,
  icon,
  footer,
  className,
  trend,
  isSimulation = false,
}) => (
  <Card
    className={`${className} ${
      isSimulation ? "border-orange-200 bg-orange-50" : ""
    }`}
  >
    <CardContent className="p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          {subtitle && <p className="text-xs text-gray-400 mb-1">{subtitle}</p>}
          <h3 className="text-3xl font-bold text-gray-900 mt-1">
            {isSimulation && (
              <span className="text-orange-600 text-lg mr-2">🔬</span>
            )}
            {value}
          </h3>

          {trend && (
            <div
              className={`mt-1 text-xs ${
                trend.positive ? "text-green-600" : "text-red-600"
              }`}
            >
              <span className="font-medium">
                {trend.positive ? "↑" : "↓"} {trend.value}%
              </span>{" "}
              {trend.label}
            </div>
          )}
        </div>
        {icon}
      </div>
      {footer && (
        <div className="mt-4">
          <div className="text-xs text-gray-500">{footer}</div>
        </div>
      )}
    </CardContent>
  </Card>
);

interface QueueStatsProps {
  totalQueues: number;
  totalPatients: number;
  avgWaitingTime?: number;
  avgServiceTime?: number;
  avgWaitTimeToday?: number;
  avgServiceTimeToday?: number;
  className?: string;
  queueDistribution?: {
    regular: number;
    urgent: number;
    elderly: number;
    special: number;
  };
  queueTypeNames?: {
    regular: string;
    urgent: string;
    elderly: string;
    special: string;
  };
  predictedWaitTime?: number;
  isSimulationMode?: boolean;
  // INS Queue props
  insQueues?: QueueIns[];
  totalInsQueues?: number;
  totalInsPatients?: number;
  waitingInsQueues?: QueueIns[];
  activeInsQueues?: QueueIns[];
}

const QueueStats: React.FC<QueueStatsProps> = ({
  totalQueues,
  totalPatients,
  avgWaitingTime = 15,
  avgServiceTime = 8,
  className,
  queueDistribution = { regular: 70, urgent: 10, elderly: 15, special: 5 },
  queueTypeNames = {
    regular: "ทั่วไป",
    urgent: "ด่วน",
    elderly: "ผู้สูงอายุ",
    special: "นัดหมาย",
  },
  predictedWaitTime,
  isSimulationMode = false,
  avgWaitTimeToday,
  avgServiceTimeToday,
  // INS Queue data
  insQueues = [],
  totalInsQueues = 0,
  totalInsPatients = 0,
  waitingInsQueues = [],
  activeInsQueues = [],
}) => {
  // Only show predicted wait time if wait time prediction is enabled
  const showPrediction =
    localStorage.getItem("enable_wait_time_prediction") !== "false";

  // Calculate current averages in minutes and round to nearest integer
  const roundedAvgWaitingTime = Math.round(avgWaitingTime);
  const roundedAvgServiceTime = Math.round(avgServiceTime);

  const roundedAvgWaitingTimeToday = Math.round(avgWaitTimeToday);
  const roundedAvgServiceTimeToday = Math.round(avgServiceTimeToday);

  console.log("avgWaitTimeToday", avgWaitTimeToday);
  console.log("predictedWaitTime", predictedWaitTime);
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Combined Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Queues Served */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500">ให้บริการทั้งหมด (วันนี้)</p>
                <p className="text-xs text-gray-400">จากข้อมูลวันนี้เท่านั้น</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Pharmacy Queue */}
              <div className="flex flex-col items-center gap-3 p-4 border border-gray-200 rounded-lg min-w-0">
                <div className="bg-blue-100 p-2 rounded-full flex-shrink-0">
                  <Pill className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-center w-full">
                  <p className="text-xs text-gray-600 mb-1">คิวรับยา</p>
                  <p className="text-2xl font-bold text-blue-600 whitespace-nowrap">{totalQueues}</p>
                </div>
              </div>

              {/* INS Queue */}
              <div className="flex flex-col items-center gap-3 p-4 border border-gray-200 rounded-lg min-w-0">
                <div className="bg-purple-100 p-2 rounded-full flex-shrink-0">
                  <Stethoscope className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-center w-full">
                  <p className="text-xs text-gray-600 mb-1">คิวตรวจ</p>
                  <p className="text-2xl font-bold text-purple-600 whitespace-nowrap">{totalInsQueues}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-500">
              อัพเดทล่าสุด{" "}
              <span className="font-medium">
                {format(new Date(), "dd MMM HH:mm น.", { locale: th })}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Average Wait Time */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500">เวลารอเฉลี่ย (วันนี้)</p>
                <p className="text-xs text-gray-400">จากข้อมูลวันนี้เท่านั้น</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Pharmacy Queue */}
              <div className="flex flex-col items-center gap-3 p-4 border border-gray-200 rounded-lg min-w-0">
                <div className="bg-blue-100 p-2 rounded-full flex-shrink-0">
                  <Pill className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-center w-full">
                  <p className="text-xs text-gray-600 mb-1">คิวรับยา</p>
                  <p className="text-2xl font-bold text-blue-600 whitespace-nowrap">{roundedAvgWaitingTimeToday} นาที</p>
                </div>
              </div>

              {/* INS Queue */}
              <div className="flex flex-col items-center gap-3 p-4 border border-gray-200 rounded-lg min-w-0">
                <div className="bg-purple-100 p-2 rounded-full flex-shrink-0">
                  <Stethoscope className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-center w-full">
                  <p className="text-xs text-gray-600 mb-1">คิวตรวจ</p>
                  <p className="text-2xl font-bold text-purple-600 whitespace-nowrap">{roundedAvgWaitingTimeToday} นาที</p>
                </div>
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-500">
              ขึ้นอยู่กับเวลารอเข้ารับบริการของวันนี้
            </div>
          </CardContent>
        </Card>

        {/* Total Patients */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500">ผู้รับบริการทั้งหมด (วันนี้)</p>
                <p className="text-xs text-gray-400">จากข้อมูลวันนี้เท่านั้น</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Pharmacy Queue */}
              <div className="flex flex-col items-center gap-3 p-4 border border-gray-200 rounded-lg min-w-0">
                <div className="bg-blue-100 p-2 rounded-full flex-shrink-0">
                  <Pill className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-center w-full">
                  <p className="text-xs text-gray-600 mb-1">คิวรับยา</p>
                  <p className="text-2xl font-bold text-blue-600 whitespace-nowrap">{totalPatients}</p>
                </div>
              </div>

              {/* INS Queue */}
              <div className="flex flex-col items-center gap-3 p-4 border border-gray-200 rounded-lg min-w-0">
                <div className="bg-purple-100 p-2 rounded-full flex-shrink-0">
                  <Stethoscope className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-center w-full">
                  <p className="text-xs text-gray-600 mb-1">คิวตรวจ</p>
                  <p className="text-2xl font-bold text-purple-600 whitespace-nowrap">{totalInsPatients}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-500">
              ข้อมูลผู้เข้ารับบริการทั้งหมดของวันนี้
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QueueStats;
