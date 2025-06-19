
import React from 'react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface PatientSelectionHeaderProps {
  onLogout: () => void;
}

const PatientSelectionHeader: React.FC<PatientSelectionHeaderProps> = ({ onLogout }) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex justify-between items-center mb-3 sm:mb-4">
      <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-pharmacy-700`}>
        ระบบติดตามคิวผู้ป่วย
      </h1>
      <Button variant="outline" size={isMobile ? "sm" : "default"} onClick={onLogout}>
        ออกจากระบบ
      </Button>
    </div>
  );
};

export default PatientSelectionHeader;
