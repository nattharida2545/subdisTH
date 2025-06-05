
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ServicePoint } from '@/integrations/supabase/schema';

interface ServicePointPanelControlsProps {
  selectedServicePoints: string[];
  enabledServicePoints: ServicePoint[];
  onServicePointChange: (index: number, servicePointId: string) => void;
}

const ServicePointPanelControls: React.FC<ServicePointPanelControlsProps> = ({
  selectedServicePoints,
  enabledServicePoints,
  onServicePointChange
}) => {
  return (
    <div className="bg-gray-100 p-4 border-b flex-shrink-0">
      <h3 className="font-medium text-gray-900 mb-3">จุดบริการ</h3>
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((index) => (
          <div key={index} className="space-y-2">
            <label className="text-xs font-medium text-gray-700">
              จุดบริการ {index + 1}
            </label>
            <Select
              value={selectedServicePoints[index] || ''}
              onValueChange={(value) => onServicePointChange(index, value)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder={`เลือก SP${index + 1}`} />
              </SelectTrigger>
              <SelectContent>
                {enabledServicePoints.map(sp => (
                  <SelectItem key={sp.id} value={sp.id} className="text-xs">
                    {sp.code} - {sp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServicePointPanelControls;
