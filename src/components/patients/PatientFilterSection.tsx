
import React from 'react';
import PatientSearch from '@/components/patients/PatientSearch';
import PatientListContainer from '@/components/patients/PatientListContainer';
import { Patient } from '@/integrations/supabase/schema';

interface PatientFilterSectionProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filteredPatients: Patient[];
  loading: boolean;
  error: string | null;
  onSelectPatient: (patient: Patient) => void;
  onEditPatient: (patient: Patient) => void;
}

const PatientFilterSection: React.FC<PatientFilterSectionProps> = ({
  searchTerm,
  onSearchChange,
  filteredPatients,
  loading,
  error,
  onSelectPatient,
  onEditPatient
}) => {
  return (
    <div className="space-y-6">
      <PatientSearch 
        searchTerm={searchTerm} 
        onSearchChange={onSearchChange} 
      />
      
      <PatientListContainer 
        patients={filteredPatients}
        loading={loading}
        error={error}
        onSelectPatient={onSelectPatient}
        onEditPatient={onEditPatient}
      />
    </div>
  );
};

export default PatientFilterSection;
