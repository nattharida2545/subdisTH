
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bug, User, Calendar } from 'lucide-react';

interface PatientPortalDebugProps {
  patients: any[];
  selectedPatient: any;
  isAuthenticated: boolean;
}

const PatientPortalDebug: React.FC<PatientPortalDebugProps> = ({ 
  patients, 
  selectedPatient, 
  isAuthenticated 
}) => {
  const navigate = useNavigate();

  const handleTestNavigation = (path: string) => {
    console.log(`[Debug] Testing navigation to: ${path}`);
    console.log(`[Debug] Current auth state:`, {
      isAuthenticated,
      selectedPatient: selectedPatient?.name,
      patientsCount: patients.length,
      lineToken: !!localStorage.getItem('lineToken'),
      userPhone: localStorage.getItem('userPhone')
    });
    
    try {
      navigate(path);
      console.log(`[Debug] Navigation to ${path} completed`);
    } catch (error) {
      console.error(`[Debug] Navigation error:`, error);
    }
  };

  return (
    <Card className="mt-4 border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-800">
          <Bug className="w-5 h-5" />
          Debug Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-yellow-700">
          <p><strong>Auth Status:</strong> {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</p>
          <p><strong>Selected Patient:</strong> {selectedPatient?.name || 'None'}</p>
          <p><strong>Patients Count:</strong> {patients.length}</p>
          <p><strong>LINE Token:</strong> {localStorage.getItem('lineToken') ? 'Present' : 'Missing'}</p>
          <p><strong>User Phone:</strong> {localStorage.getItem('userPhone') || 'Missing'}</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleTestNavigation('/patient-portal/appointments')}
            className="text-yellow-700 border-yellow-300"
          >
            <Calendar className="w-4 h-4 mr-1" />
            Test Appointments
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleTestNavigation('/patient-portal/profile')}
            className="text-yellow-700 border-yellow-300"
          >
            <User className="w-4 h-4 mr-1" />
            Test Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientPortalDebug;
