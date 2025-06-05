
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Queue, ServicePoint } from '@/integrations/supabase/schema';
import { QueueType } from '@/hooks/useQueueTypes';
import { TransferFormState } from './types';

interface QueueTransferFormFieldsProps {
  queue: Queue;
  formState: TransferFormState;
  servicePoints: ServicePoint[];
  queueTypes: QueueType[];
  currentServicePointId?: string;
  onTargetServicePointChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onQueueTypeChange: (value: string) => void;
  isTransferring: boolean;
}

const QueueTransferFormFields: React.FC<QueueTransferFormFieldsProps> = ({
  queue,
  formState,
  servicePoints,
  queueTypes,
  currentServicePointId,
  onTargetServicePointChange,
  onNotesChange,
  onQueueTypeChange,
  isTransferring
}) => {
  // Filter out the current service point from the options
  const availableServicePoints = servicePoints.filter(
    sp => sp.id !== currentServicePointId && sp.enabled
  );

  // Get the queue type name for display
  const getQueueTypeName = (typeCode: string) => {
    const queueType = queueTypes.find(type => type.code === typeCode);
    return queueType ? queueType.name : typeCode;
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="queue-number" className="text-right">
          คิวหมายเลข
        </Label>
        <div className="col-span-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{queue.number}</span>
            <span className="text-sm text-muted-foreground">({getQueueTypeName(queue.type)})</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="target-service-point" className="text-right">
          จุดบริการปลายทาง
        </Label>
        <div className="col-span-3">
          <Select
            value={formState.targetServicePointId}
            onValueChange={onTargetServicePointChange}
            disabled={isTransferring}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="เลือกจุดบริการปลายทาง" />
            </SelectTrigger>
            <SelectContent>
              {availableServicePoints.map((servicePoint) => (
                <SelectItem key={servicePoint.id} value={servicePoint.id}>
                  {servicePoint.code} - {servicePoint.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="new-queue-type" className="text-right">
          ประเภทคิว (ไม่ระบุ = คงเดิม)
        </Label>
        <div className="col-span-3">
          <Select
            value={formState.newQueueType || "KEEP_EXISTING"}
            onValueChange={(value) => onQueueTypeChange(value === "KEEP_EXISTING" ? "" : value)}
            disabled={isTransferring}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="คงประเภทคิวเดิม" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="KEEP_EXISTING">คงประเภทคิวเดิม</SelectItem>
              {queueTypes.map((queueType) => (
                <SelectItem key={queueType.id} value={queueType.code}>
                  {queueType.code} - {queueType.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="transfer-notes" className="text-right">
          หมายเหตุ
        </Label>
        <Textarea
          id="transfer-notes"
          className="col-span-3"
          placeholder="ระบุหมายเหตุ (ไม่จำเป็น)"
          value={formState.notes}
          onChange={(e) => onNotesChange(e.target.value)}
          disabled={isTransferring}
        />
      </div>
    </div>
  );
};

export default QueueTransferFormFields;
