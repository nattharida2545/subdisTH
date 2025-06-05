
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
import { ServicePoint } from '@/integrations/supabase/schema';

interface QueueTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTransfer: (servicePointId: string) => Promise<void>;
  servicePoints: ServicePoint[];
  currentServicePointId: string;
}

const QueueTransferDialog: React.FC<QueueTransferDialogProps> = ({
  open,
  onOpenChange,
  onTransfer,
  servicePoints,
  currentServicePointId
}) => {
  const [selectedServicePointId, setSelectedServicePointId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Filter out current service point
  const availableServicePoints = servicePoints.filter(sp => 
    sp.id !== currentServicePointId && sp.enabled
  );
  
  const handleSubmit = async () => {
    if (!selectedServicePointId) return;
    
    setIsSubmitting(true);
    try {
      await onTransfer(selectedServicePointId);
      onOpenChange(false);
      setSelectedServicePointId('');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>โอนคิวไปยังจุดบริการ</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {availableServicePoints.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              ไม่มีจุดบริการอื่นที่สามารถโอนได้
            </div>
          ) : (
            <RadioGroup 
              value={selectedServicePointId} 
              onValueChange={setSelectedServicePointId}
              className="space-y-3"
            >
              {availableServicePoints.map(servicePoint => (
                <div key={servicePoint.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={servicePoint.id} id={servicePoint.id} />
                  <Label htmlFor={servicePoint.id} className="flex-1">
                    <div className="font-medium">{servicePoint.name}</div>
                    <div className="text-sm text-gray-500">{servicePoint.code}</div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!selectedServicePointId || isSubmitting || availableServicePoints.length === 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? 'กำลังโอน...' : 'ยืนยันการโอน'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QueueTransferDialog;
