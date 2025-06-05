
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ServicePoint, Queue } from '@/integrations/supabase/schema';
import { MapPin, Lightbulb } from 'lucide-react';

interface ServicePointQueueSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (servicePointId: string) => void;
  queue: Queue;
  servicePoints: ServicePoint[];
  suggestedServicePoint?: ServicePoint | null;
}

const ServicePointQueueSelector: React.FC<ServicePointQueueSelectorProps> = ({
  isOpen,
  onClose,
  onConfirm,
  queue,
  servicePoints,
  suggestedServicePoint
}) => {
  const [selectedServicePointId, setSelectedServicePointId] = useState<string>(
    queue.service_point_id || suggestedServicePoint?.id || ''
  );

  const handleConfirm = () => {
    if (selectedServicePointId) {
      onConfirm(selectedServicePointId);
      onClose();
    }
  };

  const enabledServicePoints = servicePoints.filter(sp => sp.enabled);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>เลือกจุดบริการสำหรับคิวหมายเลข {queue.number}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {suggestedServicePoint && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800 mb-2">
                <Lightbulb className="w-4 h-4" />
                <span className="font-medium">แนะนำจุดบริการ</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4" />
                <span>{suggestedServicePoint.name} ({suggestedServicePoint.code})</span>
              </div>
              <p className="text-xs text-yellow-700 mt-1">
                จุดบริการนี้สามารถให้บริการคิวประเภท "{queue.type}" ได้
              </p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">เลือกจุดบริการ:</label>
            <Select value={selectedServicePointId} onValueChange={setSelectedServicePointId}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกจุดบริการ" />
              </SelectTrigger>
              <SelectContent>
                {enabledServicePoints.map(sp => (
                  <SelectItem key={sp.id} value={sp.id}>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{sp.name} ({sp.code})</span>
                      {sp.id === suggestedServicePoint?.id && (
                        <span className="text-xs text-yellow-600">(แนะนำ)</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              ยกเลิก
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={!selectedServicePointId}
            >
              เรียกคิว
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ServicePointQueueSelector;
