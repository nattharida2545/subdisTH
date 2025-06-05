
import React from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { ServicePointSelectorProps } from './types';

const ServicePointSelector: React.FC<ServicePointSelectorProps> = ({
  selectedServicePoint,
  servicePoints,
  onServicePointChange
}) => {
  return (
    <div className="flex items-center">
      <span className="text-sm mr-2">จุดบริการ:</span>
      <Select 
        value={selectedServicePoint?.id || ''} 
        onValueChange={onServicePointChange}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="เลือกจุดบริการ" />
        </SelectTrigger>
        <SelectContent>
          {servicePoints
            .filter(sp => sp.enabled)
            .map(sp => (
              <SelectItem key={sp.id} value={sp.id}>
                {sp.code} - {sp.name}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ServicePointSelector;
