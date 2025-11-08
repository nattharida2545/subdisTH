import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Patient } from "@/integrations/supabase/schema";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  ArrowLeft,
  Plus,
  Calendar,
  Edit,
  User,
  Home,
  CreditCard,
  Trash2,
} from "lucide-react";

interface SelectedPatientInfoProps {
  patient: Patient;
  onClearQueueHistory?: () => void;
}

const SelectedPatientInfo: React.FC<SelectedPatientInfoProps> = ({
  patient,
  onClearQueueHistory,
}) => {
  const isMobile = useIsMobile();

  return (
    <Card className="flex-1">
      <CardHeader className="pb-2">
        <CardTitle>ข้อมูลผู้ป่วย</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-1 text-gray-700 mb-1">
          <User className="w-4 h-4" />
          <span>{patient.name}</span>
        </div>
        {/* Patient Info */}

        {/* <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="w-4 h-4" />
            <span>{patient.phone}</span>
          </div> */}

        <div className="flex items-center gap-1 text-gray-700 mb-1">
          <CreditCard className="w-4 h-4" />
          {/* <span className="font-medium">เลขบัตรประจำตัวประชาชน:</span> */}
          <span>{patient.ID_card}</span>
        </div>

        {/* House number and Moo */}
        <div className="flex items-center gap-1 text-gray-700 mb-1">
          <Home className="w-4 h-4" />
          <span>{patient.address}</span>
        </div>

        {/* <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">รหัสผู้ป่วย:</span>
            <span>{patient.patient_id}</span>
          </div> */}
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
