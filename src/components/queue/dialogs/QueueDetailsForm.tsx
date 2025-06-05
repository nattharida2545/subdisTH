
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { QueueType } from '@/integrations/supabase/schema';

interface QueueDetailsFormProps {
  queueType: QueueType;
  setQueueType: (value: QueueType) => void;
  notes: string;
  setNotes: (value: string) => void;
  queueTypePurposes: Record<string, string>;
  shouldShow: boolean;
}

const QueueDetailsForm: React.FC<QueueDetailsFormProps> = ({
  queueType,
  setQueueType,
  notes,
  setNotes,
  queueTypePurposes,
  shouldShow
}) => {
  if (!shouldShow) {
    return null;
  }

  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor="queueType">ประเภทคิว</Label>
        <Select 
          value={queueType} 
          onValueChange={(value) => setQueueType(value as QueueType)}
        >
          <SelectTrigger id="queueType">
            <SelectValue placeholder="เลือกประเภทคิว" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="GENERAL">ทั่วไป - {queueTypePurposes['GENERAL']}</SelectItem>
            <SelectItem value="PRIORITY">ด่วน - {queueTypePurposes['PRIORITY']}</SelectItem>
            <SelectItem value="ELDERLY">ผู้สูงอายุ - {queueTypePurposes['ELDERLY']}</SelectItem>
            <SelectItem value="FOLLOW_UP">ติดตามการรักษา - {queueTypePurposes['FOLLOW_UP']}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="notes">บันทึกเพิ่มเติม</Label>
        <Input
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="บันทึกเพิ่มเติม (ถ้ามี)"
        />
      </div>
    </>
  );
};

export default QueueDetailsForm;
