
import { useState } from 'react';
import { Patient } from '@/integrations/supabase/schema';
import { usePatients } from '@/hooks/usePatients';

export const useMultiPatientSelection = () => {
  const [selectedPatients, setSelectedPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const { searchPatients } = usePatients();

  const handleSearch = async () => {
    if (searchTerm) {
      const results = await searchPatients(searchTerm);
      // Filter out already selected patients
      const filteredResults = results.filter(
        patient => !selectedPatients.some(selected => selected.id === patient.id)
      );
      setSearchResults(filteredResults);
    } else {
      setSearchResults([]);
    }
  };

  const addPatient = (patient: Patient) => {
    if (!selectedPatients.some(p => p.id === patient.id)) {
      setSelectedPatients([...selectedPatients, patient]);
      // Remove from search results
      setSearchResults(searchResults.filter(p => p.id !== patient.id));
    }
  };

  const removePatient = (patientId: string) => {
    setSelectedPatients(selectedPatients.filter(p => p.id !== patientId));
  };

  const reorderPatients = (fromIndex: number, toIndex: number) => {
    const result = Array.from(selectedPatients);
    const [removed] = result.splice(fromIndex, 1);
    result.splice(toIndex, 0, removed);
    setSelectedPatients(result);
  };

  const clearSelection = () => {
    setSelectedPatients([]);
    setSearchResults([]);
    setSearchTerm('');
  };

  return {
    selectedPatients,
    setSelectedPatients,
    searchTerm,
    setSearchTerm,
    searchResults,
    handleSearch,
    addPatient,
    removePatient,
    reorderPatients,
    clearSelection
  };
};
