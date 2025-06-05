
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';

interface PatientHeaderProps {
  onAddPatient: () => void;
}

const PatientHeader: React.FC<PatientHeaderProps> = ({ onAddPatient }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">ข้อมูลผู้ป่วย</h1>
        <p className="text-gray-500">จัดการข้อมูลและประวัติผู้ป่วย</p>
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          className="bg-pharmacy-600 hover:bg-pharmacy-700 text-white"
          onClick={onAddPatient}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          เพิ่มผู้ป่วยใหม่
        </Button>
      </div>
    </div>
  );
};

export default PatientHeader;
