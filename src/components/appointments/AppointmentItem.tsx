
import React from 'react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { Calendar, ChevronRight, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Appointment } from '@/integrations/supabase/schema';

interface AppointmentItemProps {
  appointment: Appointment;
  getPatientName: (patientId: string) => string;
  iconBgColor: string;
  iconColor: string;
  onEdit: (appointment: Appointment) => void;
  onDelete: (appointmentId: string) => void;
  dropdownKey: number; // Add this new prop
}

const AppointmentItem: React.FC<AppointmentItemProps> = ({
  appointment,
  getPatientName,
  iconBgColor,
  iconColor,
  onEdit,
  onDelete,
  dropdownKey
}) => {
  return (
    <div className="flex items-center p-4 hover:bg-gray-50">
      <div className={`w-14 h-14 flex-shrink-0 rounded-full ${iconBgColor} flex items-center justify-center ${iconColor} mr-4`}>
        <Calendar className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {getPatientName(appointment.patient_id)}
        </p>
        <p className="text-sm text-gray-500 truncate">
          {appointment.purpose}
        </p>
        <p className="text-xs text-gray-400">
          {format(new Date(appointment.date), 'dd MMM yyyy, HH:mm น.', { locale: th })}
        </p>
      </div>
      <div className="ml-4">
        <DropdownMenu key={dropdownKey}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(appointment)}>
              <Edit className="mr-2 h-4 w-4" />
              แก้ไข
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-red-600"
              onClick={() => onDelete(appointment.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              ลบ
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default AppointmentItem;
