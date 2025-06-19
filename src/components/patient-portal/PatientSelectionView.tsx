
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut, Trash2, AlertCircle, User } from 'lucide-react';
import { Patient, Queue } from '@/integrations/supabase/schema';
import PatientCardWithQueue from './PatientCardWithQueue';

interface PatientSelectionViewProps {
  patients: Patient[];
  selectedPatient: Patient | null;
  onSelectPatient: (patient: Patient) => void;
  onLogout: () => void;
  onClearQueueHistory: () => void;
}

const PatientSelectionView: React.FC<PatientSelectionViewProps> = ({
  patients,
  selectedPatient,
  onSelectPatient,
  onLogout,
  onClearQueueHistory
}) => {
  const navigate = useNavigate();

  const handleAppointmentsClick = (patient: Patient) => {
    console.log('[PatientSelectionView] Appointments button clicked for patient:', patient.name);
    
    try {
      // Store the selected patient context for the appointments page
      sessionStorage.setItem('appointmentPatientContext', JSON.stringify(patient));
      navigate('/patient-portal/appointments');
      console.log('[PatientSelectionView] Navigation to appointments initiated for patient:', patient.name);
    } catch (error) {
      console.error('[PatientSelectionView] Navigation error:', error);
    }
  };

  const handleMedicationsClick = (patient: Patient) => {
    console.log('[PatientSelectionView] Medications button clicked for patient:', patient.name);
    
    try {
      // Store the selected patient context for medications page
      sessionStorage.setItem('medicationPatientContext', JSON.stringify(patient));
      // Navigate to a medications page (you may need to create this route)
      navigate('/patient-portal/medications');
      console.log('[PatientSelectionView] Navigation to medications initiated for patient:', patient.name);
    } catch (error) {
      console.error('[PatientSelectionView] Medications navigation error:', error);
    }
  };

  const handleProfileClick = (patient: Patient) => {
    console.log('[PatientSelectionView] Profile button clicked for patient:', patient.name);
    
    try {
      // Store the selected patient context for the profile page
      sessionStorage.setItem('profilePatientContext', JSON.stringify(patient));
      navigate('/patient-portal/profile');
      console.log('[PatientSelectionView] Navigation to profile initiated for patient:', patient.name);
    } catch (error) {
      console.error('[PatientSelectionView] Profile navigation error:', error);
    }
  };

  const handleQueueClick = (patient: Patient, queue: Queue) => {
    console.log('[PatientSelectionView] Queue button clicked for patient:', patient.name, 'Queue:', queue.id);
    
    try {
      // Store both patient and queue context
      sessionStorage.setItem('queuePatientContext', JSON.stringify(patient));
      sessionStorage.setItem('activeQueueContext', JSON.stringify(queue));
      // Navigate back to the main patient portal to show active queue view
      navigate('/patient-portal');
      console.log('[PatientSelectionView] Navigation to queue view initiated');
    } catch (error) {
      console.error('[PatientSelectionView] Queue navigation error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">เลือกผู้ป่วย</h1>
          <Button
            variant="outline"
            onClick={onLogout}
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            ออกจากระบบ
          </Button>
        </div>

        {/* Multiple patients info */}
        {patients.length > 1 && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-blue-800">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">
                  พบข้อมูลผู้ป่วย {patients.length} รายการ กรุณาเลือกผู้ป่วยที่ต้องการจัดการข้อมูล
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Patient Cards */}
        <div className="space-y-4 mb-6">
          {patients.map((patient) => (
            <PatientCardWithQueue
              key={patient.id}
              patient={patient}
              isSelected={selectedPatient?.id === patient.id}
              onSelect={onSelectPatient}
              onAppointmentsClick={handleAppointmentsClick}
              onMedicationsClick={handleMedicationsClick}
              onProfileClick={handleProfileClick}
              onQueueClick={handleQueueClick}
            />
          ))}
        </div>

        {/* Clear queue history button */}
        {/* {selectedPatient && (
          <Card>
            <CardHeader>
              <CardTitle>การจัดการระบบ - {selectedPatient.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                onClick={onClearQueueHistory}
                className="w-full text-orange-600 border-orange-300 hover:bg-orange-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                ล้างประวัติคิวเก่า
              </Button>
            </CardContent>
          </Card>
        )} */}

        {/* No selection message */}
        {!selectedPatient && patients.length > 0 && (
          <Card className="border-gray-200">
            <CardContent className="p-6 text-center text-gray-500">
              <User className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>กรุณาเลือกผู้ป่วยที่ต้องการจัดการข้อมูล</p>
              <p className="text-sm mt-1">คลิกที่การ์ดผู้ป่วยด้านบนเพื่อเลือก</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PatientSelectionView;
