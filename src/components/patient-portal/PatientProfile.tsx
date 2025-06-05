
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Patient } from '@/integrations/supabase/schema';
import { User, Phone, Map, Calendar } from 'lucide-react';

interface PatientProfileProps {
  patient: Patient;
}

const PatientProfile: React.FC<PatientProfileProps> = ({ patient }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-pharmacy-600" />
          ข้อมูลผู้ป่วย
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-start gap-3 p-3 rounded-md bg-gray-50">
            <User className="h-5 w-5 text-pharmacy-600 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">ชื่อ-นามสกุล</p>
              <p className="font-medium">{patient.name}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-md bg-gray-50">
            <Phone className="h-5 w-5 text-pharmacy-600 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">เบอร์โทรศัพท์</p>
              <p className="font-medium">{patient.phone}</p>
            </div>
          </div>
          
          {patient.address && (
            <div className="flex items-start gap-3 p-3 rounded-md bg-gray-50">
              <Map className="h-5 w-5 text-pharmacy-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">ที่อยู่</p>
                <p className="font-medium">{patient.address}</p>
              </div>
            </div>
          )}
          
          {patient.birth_date && (
            <div className="flex items-start gap-3 p-3 rounded-md bg-gray-50">
              <Calendar className="h-5 w-5 text-pharmacy-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">วันเกิด</p>
                <p className="font-medium">
                  {new Date(patient.birth_date).toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Wrap with React.memo to prevent unnecessary re-renders
export default React.memo(PatientProfile);
