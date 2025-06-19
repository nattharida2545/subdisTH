
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Users } from 'lucide-react';
import { CreateAppointmentDialog } from './create-dialog/CreateAppointmentDialog';
import { BatchAppointmentDialog } from './batch-dialog/BatchAppointmentDialog';

interface AppointmentHeaderProps {
  onAppointmentsRefresh?: () => void;
}

const AppointmentHeader: React.FC<AppointmentHeaderProps> = ({ onAppointmentsRefresh }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBatchDialogOpen, setIsBatchDialogOpen] = useState(false);

  const handleCreateSuccess = () => {
    if (onAppointmentsRefresh) {
      onAppointmentsRefresh();
    }
    setIsDialogOpen(false);
  };

  const handleBatchSuccess = () => {
    if (onAppointmentsRefresh) {
      onAppointmentsRefresh();
    }
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">การนัดหมาย</h1>
        <p className="text-gray-500">จัดการการนัดหมายและติดตามการใช้ยา</p>
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          variant="outline"
          className="border-pharmacy-600 text-pharmacy-600 hover:bg-pharmacy-50"
          onClick={() => setIsBatchDialogOpen(true)}
        >
          <Users className="w-4 h-4 mr-2" />
          นัดหมายแบบกลุ่ม
        </Button>
        
        <Button 
          className="bg-pharmacy-600 hover:bg-pharmacy-700 text-white"
          onClick={() => setIsDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          สร้างนัดหมายใหม่
        </Button>
      </div>

      <CreateAppointmentDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
      
      <BatchAppointmentDialog
        open={isBatchDialogOpen}
        onOpenChange={setIsBatchDialogOpen}
        onAppointmentsCreated={handleBatchSuccess}
      />
    </div>
  );
};

export default AppointmentHeader;
