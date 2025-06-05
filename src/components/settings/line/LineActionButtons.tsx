
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, RefreshCw } from 'lucide-react';

interface LineActionButtonsProps {
  isEditing: boolean;
  isTesting: boolean;
  handleEdit: () => void;
  handleSave: () => void;
  handleCancel: () => void;
  handleTestConnection: () => void;
  isFormValid?: boolean;
}

const LineActionButtons: React.FC<LineActionButtonsProps> = ({
  isEditing,
  isTesting,
  handleEdit,
  handleSave,
  handleCancel,
  handleTestConnection,
  isFormValid = true
}) => {
  return (
    <div className="flex justify-center pt-2 space-x-2">
      {!isEditing ? (
        <>
          <Button variant="outline" onClick={handleEdit}>
            แก้ไขการเชื่อมต่อ
          </Button>
          {/* Commented out test connection button as requested
          <Button 
            onClick={handleTestConnection} 
            disabled={isTesting}
            className="min-w-[140px]"
          >
            {isTesting ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                กำลังทดสอบ...
              </>
            ) : (
              <>ทดสอบการเชื่อมต่อ</>
            )}
          </Button>
          */}
        </>
      ) : (
        <>
          <Button variant="outline" onClick={handleCancel}>
            ยกเลิก
          </Button>
          <Button 
            onClick={handleSave} 
            className="bg-green-600 hover:bg-green-700"
            disabled={!isFormValid}
          >
            <Save className="w-4 h-4 mr-2" />
            บันทึกการตั้งค่า
          </Button>
        </>
      )}
    </div>
  );
};

export default LineActionButtons;
