
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, List, Users, BarChart4 } from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

interface QueueStatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  trend?: { 
    value: number; 
    label: string;
    positive?: boolean; 
  };
}

const QueueStatCard: React.FC<QueueStatCardProps> = ({ 
  title, 
  value, 
  icon, 
  footer,
  className,
  trend
}) => (
  <Card className={className}>
    <CardContent className="p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-1">{value}</h3>
          
          {trend && (
            <div className={`mt-1 text-xs ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
              <span className="font-medium">{trend.positive ? '↑' : '↓'} {trend.value}%</span> {trend.label}
            </div>
          )}
        </div>
        {icon}
      </div>
      {footer && (
        <div className="mt-4">
          <div className="text-xs text-gray-500">
            {footer}
          </div>
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
  className?: string;
  queueDistribution?: {
    regular: number;
    urgent: number;
    elderly: number;
    special: number;
  };
  predictedWaitTime?: number;
}

const QueueStats: React.FC<QueueStatsProps> = ({ 
  totalQueues, 
  totalPatients, 
  avgWaitingTime = 15,
  avgServiceTime = 8, 
  className,
  queueDistribution = { regular: 70, urgent: 10, elderly: 15, special: 5 },
  predictedWaitTime
}) => {
  // Only show predicted wait time if wait time prediction is enabled
  const showPrediction = localStorage.getItem('enable_wait_time_prediction') !== 'false';
  
  // Calculate current averages in minutes and round to nearest integer
  const roundedAvgWaitingTime = Math.round(avgWaitingTime);
  const roundedAvgServiceTime = Math.round(avgServiceTime);
  
  return (
    <div className={`grid grid-cols-1 md:grid-cols-${showPrediction ? '4' : '3'} gap-6 ${className}`}>
      <QueueStatCard
        title="ให้บริการทั้งหมด"
        value={totalQueues}
        icon={<div className="bg-blue-100 p-3 rounded-full">
          <List className="w-6 h-6 text-blue-600" />
        </div>}
        footer={<>อัพเดทล่าสุด <span className="font-medium">{format(new Date(), 'dd MMM HH:mm น.', { locale: th })}</span></>}
        trend={{ value: 12, label: "จากสัปดาห์ที่แล้ว", positive: true }}
      />
      
      <QueueStatCard
        title="เวลารอเฉลี่ย"
        value={`${roundedAvgWaitingTime} นาที`}
        icon={<div className="bg-amber-100 p-3 rounded-full">
          <Clock className="w-6 h-6 text-amber-600" />
        </div>}
        footer={<>เปรียบเทียบรายสัปดาห์ <span className="font-medium text-green-600">-12%</span></>}
        trend={{ value: 12, label: "ลดลงจากสัปดาห์ที่แล้ว", positive: true }}
      />
      
      <QueueStatCard
        title="ผู้รับบริการทั้งหมด"
        value={totalPatients}
        icon={<div className="bg-green-100 p-3 rounded-full">
          <Users className="w-6 h-6 text-green-600" />
        </div>}
        footer={<>เฉลี่ย <span className="font-medium">{Math.round((totalQueues / totalPatients) * 10) / 10 || 0}</span> คิว/คน</>}
      />
      
      {showPrediction && predictedWaitTime !== undefined && (
        <QueueStatCard
          title="คาดการณ์เวลารอ (คิวต่อไป)"
          value={`${predictedWaitTime || roundedAvgWaitingTime} นาที`}
          icon={<div className="bg-purple-100 p-3 rounded-full">
            <BarChart4 className="w-6 h-6 text-purple-600" />
          </div>}
          footer={<>ขึ้นอยู่กับปริมาณผู้รับบริการปัจจุบัน</>}
          trend={avgWaitingTime > predictedWaitTime ? 
            { value: Math.round((avgWaitingTime - predictedWaitTime) / avgWaitingTime * 100), label: "เร็วกว่าค่าเฉลี่ย", positive: true } : 
            { value: Math.round((predictedWaitTime - avgWaitingTime) / avgWaitingTime * 100), label: "ช้ากว่าค่าเฉลี่ย", positive: false }
          }
        />
      )}
    </div>
  );
};

export default QueueStats;
