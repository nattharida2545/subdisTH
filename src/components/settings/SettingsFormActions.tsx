
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

interface SettingsFormActionsProps {
  isSubmitting: boolean;
}

const SettingsFormActions: React.FC<SettingsFormActionsProps> = ({ isSubmitting }) => {
  return (
    <div className="flex justify-end mt-6">
      <Button type="submit" className="bg-pharmacy-600 hover:bg-pharmacy-700 text-white" disabled={isSubmitting}>
        <Save className="w-4 h-4 mr-2" />
        {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
      </Button>
    </div>
  );
};

export default SettingsFormActions;
