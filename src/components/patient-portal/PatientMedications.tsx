
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pill, Info, Volume2, ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { usePatientMedications } from '@/hooks/usePatientMedications';
import { speakText } from '@/utils/textToSpeech';
import { Patient } from '@/integrations/supabase/schema';
import { useIsMobile } from '@/hooks/use-mobile';
import SelectedPatientInfo from './SelectedPatientInfo';

interface PatientMedicationsProps {
  patient: Patient;
}

const PatientMedications: React.FC<PatientMedicationsProps> = ({ patient }) => {
  const { medications, loading } = usePatientMedications(patient.id);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const handleBack = () => {
    window.location.href = '/patient-portal';
  };

  const handleSpeak = async (med: any) => {
    try {
      setSpeakingId(med.id);
      
      // Construct the text to speak in Thai
      let textToSpeak = '';
      
      if (med.medication?.description) {
        textToSpeak += med.medication.description + ' ';
      }
      
      if (med.medication?.name) {
        textToSpeak += med.medication.name + ' ';
      }
      
      if (med.dosage) {
        textToSpeak += med.dosage + ' ';
      }

      if (med.medication?.unit) {
        textToSpeak += med.medication.unit;
      }
      
      if (med.instructions) {
        textToSpeak += med.instructions + ' ';
      }
      
      // Clean up extra spaces
      textToSpeak = textToSpeak.trim();
      
      await speakText(textToSpeak);
    } catch (error) {
      console.error('Error speaking medication:', error);
    } finally {
      setSpeakingId(null);
    }
  };

  const renderMedicationContent = () => {
    if (loading) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-pharmacy-600" />
              รายการยา
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      );
    }

    if (!medications || medications.length === 0) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-pharmacy-600" />
              รายการยา
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <Info className="mx-auto h-12 w-12 text-gray-400 mb-2" />
              <p className="text-gray-600">ไม่พบข้อมูลยาสำหรับผู้ป่วยรายนี้</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-pharmacy-600" />
            รายการยา
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {medications.map((med) => (
              <div 
                key={med.id} 
                className="p-4 rounded-md border border-gray-200 hover:border-pharmacy-200 hover:bg-pharmacy-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-pharmacy-700">
                      {med.medication?.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{med.dosage} {med.medication?.unit}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-pharmacy-100 text-pharmacy-700"></span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSpeak(med)}
                      disabled={speakingId === med.id}
                      className="h-8 w-8 p-0"
                    >
                      <Volume2 className={`h-4 w-4 ${speakingId === med.id ? 'animate-pulse' : ''}`} />
                    </Button>
                  </div>
                </div>
                
                {med.medication?.description && (
                  <p className="text-sm text-gray-500 mt-2">
                    {med.medication.description}
                  </p>
                )}

                {med.instructions && (
                  <p className="text-sm text-gray-600 mt-2">
                    {med.instructions}
                  </p>
                )}
                
                <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                  <span>
                    เริ่ม: {format(new Date(med.start_date), 'PP', { locale: th })}
                  </span>
                  {med.end_date && (
                    <span>
                      สิ้นสุด: {format(new Date(med.end_date), 'PP', { locale: th })}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with back navigation */}
        <div className="flex items-center gap-3 mb-4">
          <Button 
            variant="ghost" 
            size={isMobile ? "sm" : "default"}
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {!isMobile && "กลับ"}
          </Button>
          <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-pharmacy-700`}>
            รายการยาของฉัน
          </h1>
        </div>

        <div className="grid gap-4">
          {/* Patient Information Card */}
          <SelectedPatientInfo patient={patient} />
          
          {/* Medications Content */}
          {renderMedicationContent()}
        </div>
      </div>
    </div>
  );
};

export default PatientMedications;
