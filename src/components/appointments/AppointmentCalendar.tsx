
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Appointment } from '@/integrations/supabase/schema';

interface AppointmentCalendarProps {
  appointments: Appointment[];
}

const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({ appointments }) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  // Count appointments for each day
  const appointmentDates = appointments.reduce((acc: { [key: string]: number }, appointment) => {
    const dateStr = format(new Date(appointment.date), 'yyyy-MM-dd');
    acc[dateStr] = (acc[dateStr] || 0) + 1;
    return acc;
  }, {});
  
  // Appointments for selected date
  const selectedDateAppointments = date 
    ? appointments.filter(app => 
        format(new Date(app.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      )
    : [];

  return (
    <div className="space-y-4">
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        locale={th}
        className="pointer-events-auto"
        classNames={{
          day_selected: 'bg-pharmacy-600 text-white hover:bg-pharmacy-700 focus:bg-pharmacy-700',
          day_today: 'bg-pharmacy-50 text-pharmacy-600',
        }}
        components={{
          DayContent: ({ date, activeModifiers }) => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const appointmentCount = appointmentDates[dateStr] || 0;
            
            return (
              <>
                {date.getDate()}
                {appointmentCount > 0 && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 -mb-1">
                    <div className={cn(
                      "h-1 w-1 rounded-full",
                      activeModifiers.selected ? "bg-white" : "bg-pharmacy-600"
                    )} />
                  </div>
                )}
              </>
            );
          },
        }}
      />
      
      {selectedDateAppointments.length > 0 && (
        <div className="pt-2">
          <h4 className="text-sm font-medium mb-2">
            นัดหมายวันที่ {date && format(date, 'dd MMMM yyyy', { locale: th })}
          </h4>
          <div className="space-y-2">
            {selectedDateAppointments.map(appointment => (
              <div key={appointment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                <div>
                  <Badge variant="outline" className="mb-1">
                    {format(new Date(appointment.date), 'HH:mm น.')}
                  </Badge>
                  <p className="text-sm">{appointment.purpose}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentCalendar;
