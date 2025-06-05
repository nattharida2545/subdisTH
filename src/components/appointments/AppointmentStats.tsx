
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { Calendar, Clock, Users } from 'lucide-react';

interface AppointmentStatsProps {
  todayCount: number;
  tomorrowCount: number;
  totalCount: number;
  upcomingCount: number;
}

const AppointmentStats: React.FC<AppointmentStatsProps> = ({
  todayCount,
  tomorrowCount,
  totalCount,
  upcomingCount
}) => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <Card className="dashboard-card">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">นัดหมายวันนี้</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{todayCount}</h3>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-xs text-gray-500">
              วันที่ {format(today, 'dd MMMM yyyy', { locale: th })}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="dashboard-card">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">นัดหมายพรุ่งนี้</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{tomorrowCount}</h3>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-xs text-gray-500">
              วันที่ {format(tomorrow, 'dd MMMM yyyy', { locale: th })}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="dashboard-card">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">นัดหมายทั้งหมด</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{totalCount}</h3>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-xs text-gray-500">
              กำลังรอการติดตาม <span className="font-medium text-purple-600">{upcomingCount}</span> รายการ
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentStats;
