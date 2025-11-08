
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, TrendingUp, Database, Calendar, Pill, Stethoscope } from 'lucide-react';

interface OverallStatCardProps {
  title: string;
  subtitle: string;
  value: string | number;
  icon: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

const OverallStatCard: React.FC<OverallStatCardProps> = ({ 
  title, 
  subtitle,
  value, 
  icon, 
  footer,
  className
}) => (
  <Card className={className}>
    <CardContent className="p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-xs text-gray-400 mb-1">{subtitle}</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">{value}</h3>
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

interface OverallStatsProps {
  avgWaitTime: number;
  avgServiceTime: number;
  totalCompletedQueues: number;
  className?: string;
  // INS Queue props
  insAvgWaitTime?: number;
  insAvgServiceTime?: number;
  totalCompletedInsQueues?: number;
}

const OverallStats: React.FC<OverallStatsProps> = ({
  avgWaitTime,
  avgServiceTime,
  totalCompletedQueues,
  className,
  // INS Queue data
  insAvgWaitTime = 0,
  insAvgServiceTime = 0,
  totalCompletedInsQueues = 0,
}) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
      {/* Average Wait Time */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600">เวลารอเฉลี่ย (ตั้งแต่เริ่มต้น)</p>
              <p className="text-xs text-gray-400">จากข้อมูลทั้งหมดตั้งแต่เริ่มใช้ระบบ</p>
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
                <p className="text-2xl font-bold text-blue-600 whitespace-nowrap">{Math.round(avgWaitTime)} นาที</p>
              </div>
            </div>

            {/* INS Queue */}
            <div className="flex flex-col items-center gap-3 p-4 border border-gray-200 rounded-lg min-w-0">
              <div className="bg-purple-100 p-2 rounded-full flex-shrink-0">
                <Stethoscope className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-center w-full">
                <p className="text-xs text-gray-600 mb-1">คิวตรวจ</p>
                <p className="text-2xl font-bold text-purple-600 whitespace-nowrap">{Math.round(insAvgWaitTime)} นาที</p>
              </div>
            </div>
          </div>

          <div className="mt-4 text-xs text-gray-500">
            ข้อมูลสะสมทั้งหมด
          </div>
        </CardContent>
      </Card>
      
      {/* Average Service Time */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600">เวลาให้บริการเฉลี่ย (ตั้งแต่เริ่มต้น)</p>
              <p className="text-xs text-gray-400">จากข้อมูลทั้งหมดตั้งแต่เริ่มใช้ระบบ</p>
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
                <p className="text-2xl font-bold text-blue-600 whitespace-nowrap">{Math.round(avgServiceTime)} นาที</p>
              </div>
            </div>

            {/* INS Queue */}
            <div className="flex flex-col items-center gap-3 p-4 border border-gray-200 rounded-lg min-w-0">
              <div className="bg-purple-100 p-2 rounded-full flex-shrink-0">
                <Stethoscope className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-center w-full">
                <p className="text-xs text-gray-600 mb-1">คิวตรวจ</p>
                <p className="text-2xl font-bold text-purple-600 whitespace-nowrap">{Math.round(insAvgServiceTime)} นาที</p>
              </div>
            </div>
          </div>

          <div className="mt-4 text-xs text-gray-500">
            ประสิทธิภาพโดยรวม
          </div>
        </CardContent>
      </Card>
      
      {/* Total Completed Queues */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600">คิวที่เสร็จสิ้น (ตั้งแต่เริ่มต้น)</p>
              <p className="text-xs text-gray-400">จากข้อมูลทั้งหมดตั้งแต่เริ่มใช้ระบบ</p>
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
                <p className="text-2xl font-bold text-blue-600 whitespace-nowrap">{totalCompletedQueues}</p>
              </div>
            </div>

            {/* INS Queue */}
            <div className="flex flex-col items-center gap-3 p-4 border border-gray-200 rounded-lg min-w-0">
              <div className="bg-purple-100 p-2 rounded-full flex-shrink-0">
                <Stethoscope className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-center w-full">
                <p className="text-xs text-gray-600 mb-1">คิวตรวจ</p>
                <p className="text-2xl font-bold text-purple-600 whitespace-nowrap">{totalCompletedInsQueues}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 text-xs text-gray-500">
            ข้อมูลประวัติทั้งหมด
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverallStats;
