
import React, { useState, useEffect } from 'react';
import { PatientMedication } from '@/hooks/usePatientMedications';
import { Medication } from '@/integrations/supabase/schema';
import { toast } from 'sonner';
import MedicationHistoryPanel from './MedicationHistoryPanel';
import CurrentMedicationTable, { CurrentMedication } from './CurrentMedicationTable';

interface EnhancedMedicationDispenseDialogProps {
  patientId: string;
  medications: Medication[];
  patientMedications: PatientMedication[];
  loading: boolean;
  onDispenseMedication: (data: Omit<PatientMedication, 'id' | 'created_at' | 'updated_at'>) => Promise<PatientMedication | null>;
  onRefreshHistory: () => void;
}

const EnhancedMedicationDispenseDialog: React.FC<EnhancedMedicationDispenseDialogProps> = ({
  patientId,
  medications,
  patientMedications,
  loading,
  onDispenseMedication,
  onRefreshHistory
}) => {
  const [currentMedications, setCurrentMedications] = useState<CurrentMedication[]>([]);
  const [isDispensing, setIsDispensing] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('EnhancedMedicationDispenseDialog mounted:', {
      patientId,
      medicationsCount: medications.length,
      patientMedicationsCount: patientMedications.length,
      currentMedicationsCount: currentMedications.length
    });
  }, [patientId, medications.length, patientMedications.length, currentMedications.length]);

  const handleCopySelected = (selectedMedications: PatientMedication[]) => {
    console.log('Copying selected medications:', selectedMedications);
    
    const newCurrentMeds: CurrentMedication[] = selectedMedications.map(med => ({
      id: `copied-${med.id}-${Date.now()}-${Math.random()}`, // Unique ID for each copy
      medication: med.medication!,
      dosage: med.dosage,
      instructions: med.instructions || ''
    }));

    // Only filter out medications that already exist in the current pending list (right panel)
    // Allow copying from history even if the same medication+dosage exists in today's database
    const filteredMeds = newCurrentMeds.filter(newMed => {
      const existsInCurrent = currentMedications.some(existing => 
        existing.medication.id === newMed.medication.id && existing.dosage === newMed.dosage
      );
      return !existsInCurrent;
    });

    if (filteredMeds.length !== newCurrentMeds.length) {
      const duplicateCount = newCurrentMeds.length - filteredMeds.length;
      toast.warning(`เพิ่มได้ ${filteredMeds.length} จาก ${newCurrentMeds.length} รายการ (${duplicateCount} รายการมีอยู่ในรายการปัจจุบันแล้ว)`);
    } else {
      toast.success(`คัดลอกยาเรียบร้อย ${filteredMeds.length} รายการ - สามารถแก้ไขขนาดยาและคำแนะนำได้`);
    }

    setCurrentMedications(prev => [...prev, ...filteredMeds]);
  };

  const handleCopyAll = () => {
    console.log('Copying all medications:', patientMedications);
    handleCopySelected(patientMedications);
  };

  const handleAddMedication = (medication: CurrentMedication) => {
    console.log('Adding new medication:', medication);
    
    // Check if medication already exists in current list
    const existsInCurrent = currentMedications.some(med => 
      med.medication.id === medication.medication.id && med.dosage === medication.dosage
    );
    
    if (existsInCurrent) {
      toast.error('ยานี้มีอยู่ในรายการแล้ว');
      return;
    }

    setCurrentMedications(prev => [...prev, medication]);
    toast.success('เพิ่มยาในรายการแล้ว');
  };

  const handleUpdateMedication = (id: string, updates: Partial<CurrentMedication>) => {
    console.log('Updating medication:', id, updates);
    
    // If updating dosage, check for duplicates in current list only
    if (updates.dosage) {
      const medication = currentMedications.find(med => med.id === id);
      if (medication) {
        const existsInCurrent = currentMedications.some(med => 
          med.id !== id && 
          med.medication.id === medication.medication.id && 
          med.dosage === updates.dosage
        );
        
        if (existsInCurrent) {
          toast.error('ขนาดยานี้มีอยู่ในรายการปัจจุบันแล้ว');
          return;
        }
      }
    }
    
    setCurrentMedications(prev => 
      prev.map(med => med.id === id ? { ...med, ...updates } : med)
    );
  };

  const handleRemoveMedication = (id: string) => {
    console.log('Removing medication:', id);
    setCurrentMedications(prev => prev.filter(med => med.id !== id));
    toast.success('ลบยาออกจากรายการแล้ว');
  };

  const handleSaveAll = async () => {
    if (currentMedications.length === 0) {
      toast.error('ไม่มียาที่จะจ่าย');
      return;
    }

    console.log('Starting to dispense medications:', currentMedications);
    setIsDispensing(true);
    let successCount = 0;
    let failedMedications: string[] = [];

    try {
      for (const currentMed of currentMedications) {
        console.log('Dispensing medication:', currentMed);
        
        const medicationData = {
          patient_id: patientId,
          medication_id: currentMed.medication.id,
          dosage: currentMed.dosage,
          instructions: currentMed.instructions || undefined,
          start_date: new Date().toISOString().split('T')[0],
          end_date: undefined,
          notes: undefined
        };

        console.log('Medication data to save:', medicationData);

        try {
          const result = await onDispenseMedication(medicationData);
          console.log('Dispense result:', result);
          
          if (result) {
            successCount++;
          } else {
            failedMedications.push(currentMed.medication.name);
          }
        } catch (error) {
          console.error('Error dispensing individual medication:', error);
          failedMedications.push(currentMed.medication.name);
        }
      }

      if (successCount === currentMedications.length) {
        setCurrentMedications([]);
        toast.success(`จ่ายยาเรียบร้อย ${successCount} รายการ`);
        
        // Refresh history after successful dispensing
        setTimeout(() => {
          onRefreshHistory();
        }, 500);
      } else if (successCount > 0) {
        // Remove successfully dispensed medications
        const failedMedIds = failedMedications.map(name => 
          currentMedications.find(cm => cm.medication.name === name)?.medication.id
        ).filter(Boolean);
        
        setCurrentMedications(prev => 
          prev.filter(cm => failedMedIds.includes(cm.medication.id))
        );
        
        toast.warning(`จ่ายยาได้ ${successCount} จาก ${currentMedications.length} รายการ`);
        
        // Refresh history for successful ones
        setTimeout(() => {
          onRefreshHistory();
        }, 500);
      } else {
        toast.error('ไม่สามารถจ่ายยาได้');
      }
    } catch (error) {
      console.error('Error dispensing medications:', error);
      toast.error('เกิดข้อผิดพลาดในการจ่ายยา');
    } finally {
      setIsDispensing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
      {/* Left Panel - Medication History */}
      <MedicationHistoryPanel
        medications={patientMedications}
        loading={loading}
        onCopySelected={handleCopySelected}
        onCopyAll={handleCopyAll}
      />

      {/* Right Panel - Current Medication List */}
      <CurrentMedicationTable
        medications={currentMedications}
        availableMedications={medications}
        onAddMedication={handleAddMedication}
        onUpdateMedication={handleUpdateMedication}
        onRemoveMedication={handleRemoveMedication}
        onSaveAll={handleSaveAll}
        isLoading={isDispensing}
      />
    </div>
  );
};

export default EnhancedMedicationDispenseDialog;
