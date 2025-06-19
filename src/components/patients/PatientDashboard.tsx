
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Patient } from '@/integrations/supabase/schema';
import { usePatients } from '@/hooks/usePatients';
import PatientHeader from '@/components/patients/PatientHeader';
import PatientStats from '@/components/patients/PatientStats';
import PatientFormCard from '@/components/patients/PatientFormCard';
import PatientFilterSection from '@/components/patients/PatientFilterSection';

const PatientDashboard = () => {
  const { 
    patients, 
    loading, 
    error, 
    addPatient, 
    updatePatient,
    searchPatients 
  } = usePatients();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const navigate = useNavigate();

  // Filter patients based on search term
  useEffect(() => {
    const handleSearch = async () => {
      if (searchTerm.trim() === '') {
        setFilteredPatients(patients);
      } else {
        const results = await searchPatients(searchTerm);
        setFilteredPatients(results);
      }
    };
    
    handleSearch();
  }, [searchTerm, patients, searchPatients]);

  const handleAddPatient = async (newPatient: Partial<Patient>) => {
    const result = await addPatient(newPatient);
    if (result) {
      setShowForm(false);
    }
  };
  
  const handleUpdatePatient = async (updatedPatient: Partial<Patient>) => {
    if (selectedPatient) {
      const result = await updatePatient(selectedPatient.id, updatedPatient);
      if (result) {
        setShowForm(false);
        setSelectedPatient(null);
      }
    }
  };
  
  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    // Navigate to patient detail or show detail modal
  };
  
  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowForm(true);
  };

  const handleSubmitPatient = (patientData: Partial<Patient>) => {
    if (selectedPatient) {
      handleUpdatePatient(patientData);
    } else {
      handleAddPatient(patientData);
    }
  };

  const handleAddNewPatient = () => {
    setSelectedPatient(null);
    setShowForm(true);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  return (
    <div className="p-6">
      <PatientHeader onAddPatient={handleAddNewPatient} />
      
      <PatientStats patients={patients} />
      
      {showForm ? (
        <PatientFormCard
          patient={selectedPatient}
          onSubmit={handleSubmitPatient}
          onCancel={() => {
            setShowForm(false);
            setSelectedPatient(null);
          }}
        />
      ) : (
        <PatientFilterSection
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          filteredPatients={filteredPatients}
          loading={loading}
          error={error}
          onSelectPatient={handleSelectPatient}
          onEditPatient={handleEditPatient}
        />
      )}
    </div>
  );
};

export default PatientDashboard;
