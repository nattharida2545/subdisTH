
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PharmacyQueue } from '@/hooks/usePharmacyQueue';
import { ServicePoint } from '@/integrations/supabase/schema';
import { PatientMedication } from '@/hooks/usePatientMedications';
import ActivePharmacyQueue from './ActivePharmacyQueue';
import MedicationDispenseForm from './MedicationDispenseForm';
import FinishServiceOptions from './FinishServiceOptions';
import PatientMedicationHistory from './PatientMedicationHistory';
import { useMedicationsContext } from '@/components/medications/context/MedicationsContext';

interface PharmacyServiceInterfaceProps {
  activeQueue: PharmacyQueue;
  servicePoint: ServicePoint;
  patientMedications: PatientMedication[];
  loadingPatientMeds: boolean;
  onDispenseMedication: (data: Omit<PatientMedication, 'id' | 'created_at' | 'updated_at'>) => Promise<PatientMedication | null>;
  onCompleteService: (queueId: string, notes?: string) => Promise<boolean>;
  onForwardService: (queueId: string, forwardTo: string, notes?: string) => Promise<boolean>;
}

const PharmacyServiceInterface: React.FC<PharmacyServiceInterfaceProps> = ({
  activeQueue,
  servicePoint,
  patientMedications,
  loadingPatientMeds,
  onDispenseMedication,
  onCompleteService,
  onForwardService
}) => {
  const { medications } = useMedicationsContext();

  return (
    <div className="flex-1 overflow-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Active Queue and Medication Dispensing */}
        <div className="space-y-6">
          <ActivePharmacyQueue 
            queue={activeQueue} 
            servicePoint={servicePoint}
          />
          
          <MedicationDispenseForm
            patientId={activeQueue.patient_id}
            medications={medications}
            onDispenseMedication={onDispenseMedication}
            dispensedMedications={patientMedications}
          />
          
          <FinishServiceOptions
            queueId={activeQueue.id}
            onComplete={onCompleteService}
            onForward={onForwardService}
          />
        </div>
        
        {/* Right Column - Patient Medication History */}
        <div>
          <PatientMedicationHistory
            patientName={activeQueue.patient?.name}
            medications={patientMedications}
            loading={loadingPatientMeds}
          />
        </div>
      </div>
    </div>
  );
};

export default PharmacyServiceInterface;
