
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Patient } from '@/integrations/supabase/schema';
import { useIsMobile } from '@/hooks/use-mobile';

interface SelectedPatientInfoProps {
  patient: Patient;
  onClearQueueHistory?: () => void;
}

const SelectedPatientInfo: React.FC<SelectedPatientInfoProps> = ({
  patient,
  onClearQueueHistory
}) => {
  const isMobile = useIsMobile();

  return (
    <Card className="flex-1">
      <CardHeader className="pb-2">
        <CardTitle>ข้อมูลผู้ป่วยที่เลือก</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <span className="font-medium">ชื่อ:</span> {patient.name}
          </div>
          {patient.phone && (
            <div>
              <span className="font-medium">เบอร์โทร:</span> {patient.phone}
            </div>
          )}
          {patient.patient_id && (
            <div>
              <span className="font-medium">รหัสผู้ป่วย:</span> {patient.patient_id}
            </div>
          )}
        </div>
        
        {/* <div className="text-center mt-6 space-y-2">
          {onClearQueueHistory && (
            <Button 
              variant="outline" 
              onClick={onClearQueueHistory}
              className={isMobile ? "text-sm w-full" : "w-full"}
            >
              ล้างประวัติคิวเก่า
            </Button>
          )}
        </div> */}
      </CardContent>
    </Card>
  );
};

export default SelectedPatientInfo;
