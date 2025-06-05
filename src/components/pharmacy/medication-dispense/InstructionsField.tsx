
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface InstructionsFieldProps {
  value: string;
  onChange: (value: string) => void;
}

const InstructionsField: React.FC<InstructionsFieldProps> = ({ value, onChange }) => {
  return (
    <div>
      <Label htmlFor="instructions">วิธีใช้ / คำแนะนำ</Label>
      <Textarea
        id="instructions"
        placeholder="คำแนะนำในการใช้ยา"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="resize-none"
        rows={2}
      />
    </div>
  );
};

export default InstructionsField;
