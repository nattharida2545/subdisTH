
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppointmentCalendar from './AppointmentCalendar';
import { Appointment } from '@/integrations/supabase/schema';

interface AppointmentCalendarSectionProps {
  appointments: Appointment[];
}

const AppointmentCalendarSection: React.FC<AppointmentCalendarSectionProps> = ({ appointments }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">ปฏิทินนัดหมาย</CardTitle>
      </CardHeader>
      <CardContent>
        <AppointmentCalendar appointments={appointments} />
      </CardContent>
    </Card>
  );
};

export default AppointmentCalendarSection;
