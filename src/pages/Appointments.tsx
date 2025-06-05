
import React from 'react';
import Layout from '@/components/layout/Layout';
import { useAppointments } from '@/hooks/appointments/useAppointments';
import { usePatients } from '@/hooks/usePatients';
import AppointmentHeader from '@/components/appointments/AppointmentHeader';
import AppointmentStats from '@/components/appointments/AppointmentStats';
import { AppointmentLayout } from '@/components/appointments/AppointmentLayout';
import { useAppointmentFilters } from '@/hooks/appointments/useAppointmentFilters';
import { useAppointmentCategories } from '@/hooks/appointments/useAppointmentCategories';
import { getPatientInfo } from '@/utils/patientUtils';

const Appointments = () => {
  const { appointments } = useAppointments();
  const { patients } = usePatients();
  
  const { getPatientName, getPatientPhone } = getPatientInfo(patients);
  const { todayAppointments, tomorrowAppointments, upcomingAppointments } = useAppointmentCategories(appointments);
  
  const {
    nameSearchTerm,
    setNameSearchTerm,
    phoneSearchTerm,
    setPhoneSearchTerm,
    dateRange,
    setDateRange,
    filteredAppointments,
    isFiltered,
    handleClearSearch
  } = useAppointmentFilters(appointments, patients);

  return (
    <Layout>
      <AppointmentHeader />
      
      <AppointmentStats 
        todayCount={todayAppointments.length}
        tomorrowCount={tomorrowAppointments.length}
        totalCount={appointments.length}
        upcomingCount={upcomingAppointments.length}
      />
      
      <AppointmentLayout
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
        onClearSearch={handleClearSearch}
        appointments={appointments}
      />
    </Layout>
  );
};

export default Appointments;
