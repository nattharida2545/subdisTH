
import React, { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface QueueForwardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onForward: (destination: string) => Promise<boolean>;
}

const forwardOptions = [
  { value: 'การเงิน', label: 'แผนกการเงิน' },
  { value: 'แพทย์', label: 'พบแพทย์' },
  { value: 'ห้องตรวจ', label: 'ห้องตรวจ' },
  { value: 'นัดหมาย', label: 'แผนกนัดหมาย' },
];

const QueueForwardDialog: React.FC<QueueForwardDialogProps> = ({
  open,
  onOpenChange,
  onForward
}) => {
  const [forwardDestination, setForwardDestination] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async () => {
    if (!forwardDestination) return false;
    
    setIsSubmitting(true);
    const result = await onForward(forwardDestination);
    setIsSubmitting(false);
    return result;
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>ส่งต่อผู้ป่วยไปยัง</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <RadioGroup 
            value={forwardDestination} 
            onValueChange={setForwardDestination}
            className="space-y-3"
          >
            {forwardOptions.map(option => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!forwardDestination || isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? 'กำลังดำเนินการ...' : 'ยืนยันการส่งต่อ'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QueueForwardDialog;
