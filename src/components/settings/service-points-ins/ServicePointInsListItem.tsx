import React from 'react';
import { Button } from '@/components/ui/button';
import { ServicePoint } from '@/integrations/supabase/schema';
import { Pencil, Trash2 } from 'lucide-react';
import ServicePointInsDeleteDialog from './ServicePointInsDeleteDialog';

interface ServicePointInsListItemProps {
  servicePoint: ServicePoint;
  onEdit: (servicePoint: ServicePoint) => void;
  onDelete: (id: string) => Promise<void>;
}

const ServicePointInsListItem: React.FC<ServicePointInsListItemProps> = ({
  servicePoint,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="flex items-center justify-between border-b py-4 last:border-0">
      <div className="space-y-1">
        <div className="flex items-center">
          <span className="font-medium">{servicePoint.code}</span>
          {!servicePoint.enabled && (
            <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">ปิดการใช้งาน</span>
          )}
        </div>
        <div className="text-sm text-gray-500">{servicePoint.name}</div>
        {servicePoint.location && <div className="text-xs text-gray-400">{servicePoint.location}</div>}
      </div>
      <div className="flex space-x-2">
        <Button variant="ghost" size="sm" onClick={() => onEdit(servicePoint)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <ServicePointInsDeleteDialog servicePoint={servicePoint} onDelete={onDelete} />
      </div>
    </div>
  );
};

export default ServicePointInsListItem;
