
import * as React from 'react';
import { Medication } from '@/integrations/supabase/schema';
import { useMedications } from '@/hooks/useMedications';

type MedicationsContextType = {
  medications: Medication[];
  loading: boolean;
  error: string | null;
  fetchMedications: () => Promise<void>;
  addMedication: (data: any) => Promise<any>;
  updateMedication: (id: string, data: any) => Promise<any>;
  deleteMedication: (id: string) => Promise<boolean>;
  selectedMedication: Medication | null;
  setSelectedMedication: (medication: Medication | null) => void;
  isDialogOpen: boolean;
  setIsDialogOpen: (isOpen: boolean) => void;
};

export const MedicationsContext = React.createContext<MedicationsContextType | undefined>(undefined);

export const MedicationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { 
    medications, 
    loading, 
    error, 
    fetchMedications, 
    addMedication,
    updateMedication,
    deleteMedication 
  } = useMedications();
  const [selectedMedication, setSelectedMedication] = React.useState<Medication | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  // Remove the useEffect that automatically fetches medications since useMedications already does this

  const value = {
    medications,
    loading,
    error,
    fetchMedications,
    addMedication,
    updateMedication,
    deleteMedication,
    selectedMedication,
    setSelectedMedication,
    isDialogOpen,
    setIsDialogOpen,
  };

  return (
    <MedicationsContext.Provider value={value}>
      {children}
    </MedicationsContext.Provider>
  );
};

export const useMedicationsContext = () => {
  const context = React.useContext(MedicationsContext);
  if (context === undefined) {
    throw new Error('useMedicationsContext must be used within a MedicationsProvider');
  }
  return context;
};
