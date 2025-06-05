
import * as React from 'react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';
import { PlusCircle } from 'lucide-react';
import MedicationsSummaryCards from '@/components/medications/MedicationsSummaryCards';
import MedicationsTabs from '@/components/medications/MedicationsTabs';
import { MedicationsProvider, useMedicationsContext } from '@/components/medications/context/MedicationsContext';
import MedicationsDialog from '@/components/medications/dialog/MedicationsDialog';
import SearchInput from '@/components/medications/SearchInput';

const MedicationsContent = () => {
  const { 
    medications, 
    loading, 
    addMedication, 
    updateMedication,
    selectedMedication, 
    setSelectedMedication,
    isDialogOpen,
    setIsDialogOpen
  } = useMedicationsContext();
  
  const [searchTerm, setSearchTerm] = React.useState('');

  // Ensure medications is an array even if it's undefined
  const medicationItems = medications || [];

  const handleCreateMedication = () => {
    setSelectedMedication(null);
    setIsDialogOpen(true);
  };

  const handleEditMedication = (medication: any) => {
    setSelectedMedication(medication);
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <p>กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ยาและเวชภัณฑ์</h1>
          <p className="text-gray-500">จัดการคลังยาและเวชภัณฑ์</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            className="bg-pharmacy-600 hover:bg-pharmacy-700 text-white"
            onClick={handleCreateMedication}
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            เพิ่มรายการยาใหม่
          </Button>
        </div>
      </div>
      
      <MedicationsSummaryCards medications={medicationItems} />
      
      <div className="flex mb-4">
        <SearchInput 
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="ค้นหายาและเวชภัณฑ์..."
        />
      </div>
      
      <MedicationsTabs 
        medications={medicationItems} 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm}
        onEditMedication={handleEditMedication}
      />
      
      <MedicationsDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        medication={selectedMedication}
        medications={medicationItems}
        addMedication={addMedication}
        updateMedication={updateMedication}
      />
    </>
  );
};

const Medications = () => {
  return (
    <Layout>
      <MedicationsProvider>
        <MedicationsContent />
      </MedicationsProvider>
    </Layout>
  );
};

export default Medications;
