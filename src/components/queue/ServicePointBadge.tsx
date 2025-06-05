
import React from 'react';
import { MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ServicePointBadgeProps {
  servicePointName?: string;
  suggestedServicePointName?: string;
  isAssigned?: boolean;
  className?: string;
}

const ServicePointBadge: React.FC<ServicePointBadgeProps> = ({
  servicePointName,
  suggestedServicePointName,
  isAssigned = false,
  className = ''
}) => {
  if (servicePointName) {
    return (
      <Badge 
        variant="default" 
        className={`bg-green-600 hover:bg-green-700 text-white flex items-center gap-1 ${className}`}
      >
        <MapPin className="w-3 h-3" />
        {servicePointName}
      </Badge>
    );
  }

  if (suggestedServicePointName) {
    return (
      <Badge 
        variant="outline" 
        className={`border-yellow-300 bg-yellow-50 text-yellow-800 flex items-center gap-1 ${className}`}
      >
        <MapPin className="w-3 h-3" />
        แนะนำ: {suggestedServicePointName}
      </Badge>
    );
  }

  return (
    <Badge 
      variant="secondary" 
      className={`bg-gray-100 text-gray-600 flex items-center gap-1 ${className}`}
    >
      <MapPin className="w-3 h-3" />
      ยังไม่กำหนดจุดบริการ
    </Badge>
  );
};

export default ServicePointBadge;
