
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, PhoneCall } from 'lucide-react';
import LineLoginButton from '@/components/patient-portal/LineLoginButton';
import PatientPhoneSearch from './PatientPhoneSearch';
import { Patient } from '@/integrations/supabase/schema';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PatientPortalAuthProps {
  onLoginSuccess: (token: string, userPhone: string) => void;
  onPatientSelect: (patient: Patient) => void;
}

const PatientPortalAuth: React.FC<PatientPortalAuthProps> = ({ 
  onLoginSuccess, 
  onPatientSelect 
}) => {
  // Always define state hooks first
  const [activeTab, setActiveTab] = useState<string>("patient");
  
  // Define other hooks like useNavigate after state hooks
  const navigate = useNavigate();

  // Define callbacks with useCallback if needed
  const handlePatientFound = (patient: Patient) => {
    onPatientSelect(patient);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">ระบบติดตามคิวผู้ป่วย</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="patient" value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="patient">
              <LineLoginButton onLoginSuccess={onLoginSuccess} />
            </TabsContent>
            
            <TabsContent value="staff">
              <div className="text-center mb-4">
                <PhoneCall className="mx-auto h-16 w-16 text-pharmacy-600 mb-2" />
              </div>
              
              <PatientPhoneSearch onPatientFound={handlePatientFound} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientPortalAuth;
