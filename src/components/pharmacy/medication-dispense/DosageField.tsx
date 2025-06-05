
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DosageFieldProps {
  value: string;
  onChange: (value: string) => void;
  unit?: string;
}

const DosageField: React.FC<DosageFieldProps> = ({ value, onChange, unit }) => {
  return (
    <div className="w-full md:w-1/3">
      <Label htmlFor="dosage">
        ขนาดยา{unit && ` (${unit})`}
      </Label>
      <Input
        id="dosage"
        placeholder="เช่น 1x3 pc"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default DosageField;
