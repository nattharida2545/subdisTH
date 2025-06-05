
import React from 'react';
import { Tabs } from '@/components/ui/tabs';
import AppointmentSearchForm from './AppointmentSearchForm';
import AppointmentTabsList from './tabs/AppointmentTabsList';
import AppointmentTabContent from './tabs/AppointmentTabContent';
import { Appointment } from '@/integrations/supabase/schema';

interface AppointmentTabsProps {
  todayAppointments: Appointment[];
  tomorrowAppointments: Appointment[];
  upcomingAppointments: Appointment[];
  nameSearchTerm: string;
  setNameSearchTerm: (value: string) => void;
  phoneSearchTerm: string;
  setPhoneSearchTerm: (value: string) => void;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  setDateRange: (range: { from: Date | undefined; to: Date | undefined }) => void;
  getPatientName: (patientId: string) => string;
  getPatientPhone: (patientId: string) => string;
  filteredAppointments: Appointment[];
  isFiltered: boolean;
  onClearSearch: () => void;
}

const AppointmentTabs: React.FC<AppointmentTabsProps> = ({
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
  filteredAppointments,
  isFiltered,
  onClearSearch
}) => {
  return (
    <Tabs defaultValue="today" className="space-y-4">
      <AppointmentTabsList 
        todayCount={todayAppointments.length}
        tomorrowCount={tomorrowAppointments.length}
        upcomingCount={upcomingAppointments.length}
        isFiltered={isFiltered}
        filteredCount={filteredAppointments.length}
      />
      
      <AppointmentSearchForm
        nameSearchTerm={nameSearchTerm}
        setNameSearchTerm={setNameSearchTerm}
        phoneSearchTerm={phoneSearchTerm}
        setPhoneSearchTerm={setPhoneSearchTerm}
        dateRange={dateRange}
        setDateRange={setDateRange}
        onClearSearch={onClearSearch}
        isFiltered={isFiltered}
      />
      
      <AppointmentTabContent 
        value="today"
        appointments={todayAppointments}
        getPatientName={getPatientName}
        emptyMessage="ไม่มีนัดหมายในวันนี้"
        iconBgColor="bg-green-100"
        iconColor="text-green-600"
      />
      
      <AppointmentTabContent 
        value="tomorrow"
        appointments={tomorrowAppointments}
        getPatientName={getPatientName}
        emptyMessage="ไม่มีนัดหมายในวันพรุ่งนี้"
        iconBgColor="bg-blue-100"
        iconColor="text-blue-600"
      />
      
      <AppointmentTabContent 
        value="upcoming"
        appointments={upcomingAppointments}
        getPatientName={getPatientName}
        emptyMessage="ไม่มีนัดหมายในอนาคต"
        iconBgColor="bg-purple-100"
        iconColor="text-purple-600"
      />

      {isFiltered && (
        <AppointmentTabContent 
          value="search-results"
          appointments={filteredAppointments}
          getPatientName={getPatientName}
          emptyMessage="ไม่พบนัดหมายที่ตรงกับเงื่อนไขการค้นหา"
          iconBgColor="bg-amber-100"
          iconColor="text-amber-600"
        />
      )}
    </Tabs>
  );
};

export default AppointmentTabs;
