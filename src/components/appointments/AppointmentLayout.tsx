
import React from 'react';
import { Appointment } from '@/integrations/supabase/schema';
import AppointmentTabs from './AppointmentTabs';
import AppointmentCalendarSection from './AppointmentCalendarSection';

interface AppointmentLayoutProps {
  todayAppointments: Appointment[];
  tomorrowAppointments: Appointment[];
  upcomingAppointments: Appointment[];
  nameSearchTerm: string;
  setNameSearchTerm: (value: string) => void;
  phoneSearchTerm: string;
  setPhoneSearchTerm: (value: string) => void;
  dateRange: { from: Date | undefined; to: Date | undefined };
  setDateRange: (range: { from: Date | undefined; to: Date | undefined }) => void;
  getPatientName: (patientId: string) => string;
  getPatientPhone: (patientId: string) => string;
  filteredAppointments: Appointment[];
  isFiltered: boolean;
  onClearSearch: () => void;
  appointments: Appointment[];
}

export const AppointmentLayout: React.FC<AppointmentLayoutProps> = ({
  todayAppointments,
  tomorrowAppointments,
  upcomingAppointments,
  nameSearchTerm,
  setNameSearchTerm,
  phoneSearchTerm,
  setPhoneSearchTerm,
  dateRange,
  setDateRange,
  getPatientName,
  getPatientPhone,
  filteredAppointments,
  isFiltered,
  onClearSearch,
  appointments
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <AppointmentTabs 
          todayAppointments={todayAppointments}
          tomorrowAppointments={tomorrowAppointments}
          upcomingAppointments={upcomingAppointments}
          nameSearchTerm={nameSearchTerm}
          setNameSearchTerm={setNameSearchTerm}
          phoneSearchTerm={phoneSearchTerm}
          setPhoneSearchTerm={setPhoneSearchTerm}
          dateRange={dateRange}
          setDateRange={setDateRange}
          getPatientName={getPatientName}
          getPatientPhone={getPatientPhone}
          filteredAppointments={filteredAppointments}
          isFiltered={isFiltered}
          onClearSearch={onClearSearch}
        />
      </div>
      <div>
        <AppointmentCalendarSection appointments={appointments} />
      </div>
    </div>
  );
};
