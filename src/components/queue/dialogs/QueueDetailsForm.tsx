
import React, { useEffect, useState } from 'react';
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
import { useQueueTypesData } from '@/hooks/useQueueTypesData';

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
  const { queueTypes, loading } = useQueueTypesData();
  const [enabledQueueTypes, setEnabledQueueTypes] = useState<any[]>([]);

  useEffect(() => {
    if (queueTypes && queueTypes.length > 0) {
      // Filter only enabled queue types
      const enabled = queueTypes.filter(qt => qt.enabled);
      setEnabledQueueTypes(enabled);
      
      // If current queueType is not in the enabled list, set to first enabled type
      if (enabled.length > 0 && !enabled.find(qt => qt.code === queueType)) {
        setQueueType(enabled[0].code as QueueType);
      }
    }
  }, [queueTypes, queueType, setQueueType]);

  if (!shouldShow) {
    return null;
  }

  if (loading) {
    return (
      <div className="grid gap-2">
        <Label>กำลังโหลดประเภทคิว...</Label>
      </div>
    );
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
            {enabledQueueTypes.map(qt => (
              <SelectItem key={qt.code} value={qt.code}>
                {qt.name} - {qt.purpose || 'ไม่มีคำอธิบาย'}
              </SelectItem>
            ))}
            {enabledQueueTypes.length === 0 && (
              <SelectItem value="GENERAL" disabled>
                ไม่มีประเภทคิวที่เปิดใช้งาน
              </SelectItem>
            )}
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
