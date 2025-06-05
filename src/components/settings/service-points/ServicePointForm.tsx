
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ServicePoint } from '@/integrations/supabase/schema';
import { Save, X } from 'lucide-react';

interface ServicePointFormProps {
  formData: Partial<ServicePoint>;
  onCancel: () => void;
  onSave: () => void;
  onChange: (field: keyof ServicePoint, value: any) => void;
}

const ServicePointForm: React.FC<ServicePointFormProps> = ({
  formData,
  onCancel,
  onSave,
  onChange,
}) => {
  return (
    <div className="space-y-4 p-4 border rounded-md bg-gray-50">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="code">รหัสจุดบริการ</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={e => onChange('code', e.target.value)}
            placeholder="รหัสจุดบริการ เช่น SP01"
          />
        </div>
        <div>
          <Label htmlFor="name">ชื่อจุดบริการ</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={e => onChange('name', e.target.value)}
            placeholder="ชื่อจุดบริการ"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="location">ตำแหน่ง (ไม่บังคับ)</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={e => onChange('location', e.target.value)}
          placeholder="ตำแหน่งของจุดบริการ"
        />
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="enabled"
          checked={formData.enabled}
          onCheckedChange={value => onChange('enabled', value)}
        />
        <Label htmlFor="enabled">เปิดใช้งานจุดบริการ</Label>
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          ยกเลิก
        </Button>
        <Button type="button" onClick={onSave}>
          <Save className="h-4 w-4 mr-2" />
          บันทึก
        </Button>
      </div>
    </div>
  );
};

export default ServicePointForm;
