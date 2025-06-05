
import React from 'react';
import { FormatOption } from './schemas';

interface QueueTypeFormatsProps {
  index: number;
  format: '0' | '00' | '000';
  formatOptions: FormatOption[];
  onChange: (format: '0' | '00' | '000') => void;
}

const QueueTypeFormats = ({ index, format, formatOptions, onChange }: QueueTypeFormatsProps) => {
  return (
    <div className="space-y-2">
      {formatOptions.map((option) => (
        <div key={option.value} className="flex items-center">
          <input
            type="radio"
            id={`queueType_${index}_format_${option.value}`}
            name={`queueType_${index}_format`}
            className="mr-2"
            checked={format === option.value}
            onChange={() => onChange(option.value)}
          />
          <label htmlFor={`queueType_${index}_format_${option.value}`} className="text-sm">
            {option.label}
            <div className="text-xs text-gray-500">ตัวอย่าง: {option.example}</div>
          </label>
        </div>
      ))}
    </div>
  );
};

export default QueueTypeFormats;
