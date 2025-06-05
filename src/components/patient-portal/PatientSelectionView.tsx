
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Patient } from '@/integrations/supabase/schema';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

interface PatientSelectionViewProps {
  patients: Patient[];
  selectedPatient: Patient | null;
  onSelectPatient: (patient: Patient) => void;
  onLogout: () => void;
  onClearQueueHistory?: () => void; // Add this prop
}

const PatientSelectionView: React.FC<PatientSelectionViewProps> = ({
  patients,
  selectedPatient,
  onSelectPatient,
  onLogout,
  onClearQueueHistory
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 p-2 sm:p-4">
      <div className="flex justify-between items-center mb-3 sm:mb-4">
        <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-pharmacy-700`}>
          ระบบติดตามคิวผู้ป่วย
        </h1>
        <Button variant="outline" size={isMobile ? "sm" : "default"} onClick={onLogout}>
          ออกจากระบบ
        </Button>
      </div>
      
      <Card className="mb-3 sm:mb-4">
        <CardHeader className="pb-2">
          <CardTitle>เลือกผู้ป่วย</CardTitle>
        </CardHeader>
        <CardContent>
          {patients.length === 0 ? (
            <p className="text-center text-gray-500 py-4">ไม่พบข้อมูลผู้ป่วย</p>
          ) : (
            <div className="grid gap-2">
              {patients.map(patient => (
                <Button
                  key={patient.id}
                  variant={selectedPatient?.id === patient.id ? "default" : "outline"}
                  className="w-full justify-start text-left"
                  onClick={() => onSelectPatient(patient)}
                >
                  <div className="truncate">
                    <span className="font-medium">{patient.name}</span>
                    {patient.phone && (
                      <span className="ml-2 text-sm text-gray-500">{patient.phone}</span>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="flex-1">
        <CardHeader className="pb-2">
          <CardTitle>ไม่มีคิวที่รอดำเนินการ</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-6">
            คุณไม่มีคิวที่รอดำเนินการอยู่ในขณะนี้
          </p>
          
          <div className="text-center mt-4 space-y-2">
            {onClearQueueHistory && (
              <Button 
                variant="outline" 
                onClick={onClearQueueHistory}
                className={isMobile ? "text-sm w-full" : "w-full"}
              >
                ล้างประวัติคิวเก่า
              </Button>
            )}
            
            {/* <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className={isMobile ? "text-sm w-full" : "w-full"}
            >
              กลับไปหน้าหลัก
            </Button> */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientSelectionView;
