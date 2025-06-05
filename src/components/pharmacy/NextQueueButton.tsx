
import React from 'react';
import { Button } from '@/components/ui/button';
import { Phone, Loader2 } from 'lucide-react';

interface NextQueueButtonProps {
  onCallNext: () => Promise<void>;
  isLoading: boolean;
  disabled?: boolean;
}

const NextQueueButton: React.FC<NextQueueButtonProps> = ({
  onCallNext,
  isLoading,
  disabled = false
}) => {
  return (
    <Button
      onClick={onCallNext}
      disabled={disabled || isLoading}
      className="bg-pharmacy-600 hover:bg-pharmacy-700 text-white"
      size="lg"
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
      ) : (
        <Phone className="h-5 w-5 mr-2" />
      )}
      {disabled ? 'กำลังให้บริการ' : isLoading ? 'กำลังเรียก...' : 'เรียกคิวถัดไป'}
    </Button>
  );
};

export default NextQueueButton;
