
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { UserPlus, MapPin, RefreshCw } from 'lucide-react';
import { Patient } from '@/integrations/supabase/schema';

interface PatientStatsProps {
  patients: Patient[];
}

const PatientStats: React.FC<PatientStatsProps> = ({ patients }) => {
  // Calculate percentage of patients within 20km
  const nearbyPercentage = Math.round(
    (patients.filter(p => 
      p.distance_from_hospital !== undefined && 
      p.distance_from_hospital <= 20
    ).length / (patients.length || 1)) * 100
  );

  // Calculate percentage of patients with LINE ID
  const lineIdPercentage = Math.round(
    (patients.filter(p => p.line_id).length / (patients.length || 1)) * 100
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <Card className="dashboard-card">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">จำนวนผู้ป่วยทั้งหมด</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{patients.length}</h3>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <UserPlus className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-xs text-gray-500">
              ข้อมูลจากฐานข้อมูล Supabase
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="dashboard-card">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">ผู้ป่วยในพื้นที่</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">
                {nearbyPercentage}%
              </h3>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <MapPin className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-xs text-gray-500">
              ห่างจากโรงพยาบาลไม่เกิน 20 กิโลเมตร
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="dashboard-card">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">ผู้ป่วยที่มี LINE ID</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">
                {lineIdPercentage}%
              </h3>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <RefreshCw className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-xs text-gray-500">
              สามารถติดต่อผ่าน LINE ได้
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientStats;
