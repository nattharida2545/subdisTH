import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ListChecks, BarChart, Users, Pill, Calendar, Clock, PlusCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { appointmentQueueService } from '@/services/appointmentQueueService';

interface DashboardCardsProps {
  waitingQueues: any[];
  activeQueues: any[];
  completedQueues: any[];
  patientsCount: number;
  avgWaitTime: number;
}

const DashboardCards: React.FC<DashboardCardsProps> = ({
  waitingQueues,
  activeQueues,
  completedQueues,
  patientsCount,
  avgWaitTime
}) => {
  // Auto-sync appointments to queues when dashboard loads
  useEffect(() => {
    const syncAppointments = async () => {
      console.log('[DashboardCards] Auto-syncing appointments to queues...');
      await appointmentQueueService.createQueuesFromAppointments();
      await appointmentQueueService.syncAppointmentQueueStatus();
    };
    
    syncAppointments();
  }, []);

  const handleSyncAppointments = async () => {
    await appointmentQueueService.createQueuesFromAppointments();
    await appointmentQueueService.syncAppointmentQueueStatus();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <Card className="h-full bg-gradient-to-br from-blue-50 to-purple-50 hover:shadow-md border-blue-100">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center">
            <ListChecks className="mr-2 h-5 w-5 text-blue-600" />
            จัดการคิว
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">จัดการคิวรอดำเนินการ กำลังให้บริการ และเสร็จสิ้น</p>
          <div className="mt-4 text-sm text-blue-600">
            คิวรอดำเนินการ: {waitingQueues.length} | กำลังให้บริการ: {activeQueues.length}
          </div>
        </CardContent>
        <CardFooter className="pt-2 flex justify-between">
          <Button asChild variant="outline" size="sm" className="text-blue-600 border-blue-200">
            <Link to="/queue">
              จัดการคิว
            </Link>
          </Button>
          <div className="flex gap-1">
            <Button 
              onClick={handleSyncAppointments}
              variant="outline" 
              size="sm" 
              className="text-green-600 border-green-200"
              title="ซิงค์การนัดหมายกับคิว"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
            <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
              <Link to="/queue/create">
                <PlusCircle className="h-3 w-3 mr-1" />
                สร้างคิวใหม่
              </Link>
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      <Link to="/analytics" className="transition-transform hover:scale-105">
        <Card className="h-full bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-md border-green-100">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <BarChart className="mr-2 h-5 w-5 text-green-600" />
              การวิเคราะห์
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">ข้อมูลวิเคราะห์และสถิติของระบบคิว</p>
            <div className="mt-4 text-sm text-green-600">
              เวลารอเฉลี่ย: {Math.round(avgWaitTime)} นาที
            </div>
          </CardContent>
        </Card>
      </Link>
      
      <Link to="/patients" className="transition-transform hover:scale-105">
        <Card className="h-full bg-gradient-to-br from-amber-50 to-yellow-50 hover:shadow-md border-amber-100">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5 text-amber-600" />
              ผู้ป่วย
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">จัดการข้อมูลผู้ป่วยและประวัติ</p>
            <div className="mt-4 text-sm text-amber-600">
              ผู้ป่วยทั้งหมด: {patientsCount}
            </div>
          </CardContent>
        </Card>
      </Link>
      
      <Link to="/medications" className="transition-transform hover:scale-105">
        <Card className="h-full bg-gradient-to-br from-red-50 to-pink-50 hover:shadow-md border-red-100">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Pill className="mr-2 h-5 w-5 text-red-600" />
              ยาและเวชภัณฑ์
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">จัดการรายการยาและเวชภัณฑ์</p>
            <div className="mt-4 text-sm text-red-600">
              ดูรายละเอียดเพิ่มเติม
            </div>
          </CardContent>
        </Card>
      </Link>
      
      <Link to="/appointments" className="transition-transform hover:scale-105">
        <Card className="h-full bg-gradient-to-br from-indigo-50 to-blue-50 hover:shadow-md border-indigo-100">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-indigo-600" />
              นัดหมาย
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">จัดการการนัดหมายและตารางนัด</p>
            <div className="mt-4 text-sm text-indigo-600">
              ดูตารางนัดหมาย
            </div>
          </CardContent>
        </Card>
      </Link>
      
      <Link to="/queue-history" className="transition-transform hover:scale-105">
        <Card className="h-full bg-gradient-to-br from-purple-50 to-violet-50 hover:shadow-md border-purple-100">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5 text-purple-600" />
              ประวัติคิว
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">ดูประวัติคิวที่ให้บริการไปแล้ว</p>
            <div className="mt-4 text-sm text-purple-600">
              บริการทั้งหมด: {completedQueues.length}
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
};

export default DashboardCards;
