
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LineQRCode from '@/components/ui/LineQRCode';
import { QrCode, TrendingUp, Clock, Users } from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

const DashboardSidebar: React.FC<{
  completedQueuesLength: number;
}> = ({ completedQueuesLength }) => {
  return (
    <div className="space-y-6">
      <Card className="dashboard-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <QrCode className="h-5 w-5 mr-2 text-pharmacy-600" />
            ลงทะเบียนผ่าน LINE
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LineQRCode queueNumber={999} />
          <div className="mt-4 text-center text-sm text-gray-500">
            <p>สแกนเพื่อเข้าสู่ระบบการจองคิวออนไลน์</p>
            <p className="mt-1 text-xs text-pharmacy-600">ลงทะเบียนออนไลน์เพื่อลดระยะเวลารอคิว</p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="dashboard-card bg-pharmacy-50 border-pharmacy-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-pharmacy-800 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-pharmacy-600" />
            สถิติการให้บริการ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 flex items-center">
                <Clock className="h-4 w-4 mr-1.5 text-pharmacy-500" />
                เวลาเฉลี่ยต่อคิว
              </span>
              <span className="font-semibold">12 นาที</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 flex items-center">
                <Users className="h-4 w-4 mr-1.5 text-pharmacy-500" />
                ผู้รับบริการวันนี้
              </span>
              <span className="font-semibold">{completedQueuesLength} คน</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">เวลารอเฉลี่ย</span>
              <span className="font-semibold">25 นาที</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">คิวสูงสุดวันนี้</span>
              <span className="font-semibold">8</span>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-pharmacy-100">
            <p className="text-xs text-gray-500">
              อัพเดทล่าสุด: {format(new Date(), 'dd MMMM yyyy, HH:mm น.', { locale: th })}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardSidebar;
