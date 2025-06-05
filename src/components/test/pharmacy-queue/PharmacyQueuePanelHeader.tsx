
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { ServicePoint } from '@/integrations/supabase/schema';

interface PharmacyQueuePanelHeaderProps {
  title: string;
  servicePoint: ServicePoint;
  isLoading: boolean;
  waitingCount: number;
  activeCount: number;
}

const PharmacyQueuePanelHeader: React.FC<PharmacyQueuePanelHeaderProps> = ({
  title,
  servicePoint,
  isLoading,
  waitingCount,
  activeCount
}) => {
  return (
    <div className="p-3 border-b flex-shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate">{title}</h3>
          <p className="text-xs text-gray-500 truncate">
            {servicePoint.code} - {servicePoint.name}
          </p>
        </div>
        
        <div className="flex items-center gap-2 text-xs ml-2">
          {isLoading && (
            <Loader2 className="w-3 h-3 animate-spin text-gray-500" />
          )}
          <Badge variant="outline" className="bg-orange-50 text-orange-700 text-xs">
            รอ: {waitingCount}
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">
            ให้บริการ: {activeCount}
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default PharmacyQueuePanelHeader;
