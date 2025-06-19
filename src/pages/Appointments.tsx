
import React, { useEffect } from 'react';
import { useAppointments } from '@/hooks/appointments/useAppointments';
import { usePatients } from '@/hooks/usePatients';
import AppointmentHeader from '@/components/appointments/AppointmentHeader';
import AppointmentStats from '@/components/appointments/AppointmentStats';
import { AppointmentLayout } from '@/components/appointments/AppointmentLayout';
import { useAppointmentFilters } from '@/hooks/appointments/useAppointmentFilters';
import { useAppointmentCategories } from '@/hooks/appointments/useAppointmentCategories';
import { getPatientInfo } from '@/utils/patientUtils';
import { appointmentQueueService } from '@/services/appointmentQueueService';

const Appointments = () => {
  const { appointments, fetchAppointments } = useAppointments();
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

  // Auto-sync appointments to queues when appointments page loads
  useEffect(() => {
    const syncAppointments = async () => {
      console.log('[Appointments] Auto-syncing appointments to queues...');
      await appointmentQueueService.createQueuesFromAppointments();
      await appointmentQueueService.syncAppointmentQueueStatus();
    };
    
    syncAppointments();
  }, []);

  const handleAppointmentsRefresh = async () => {
    await fetchAppointments();
    await appointmentQueueService.createQueuesFromAppointments();
    await appointmentQueueService.syncAppointmentQueueStatus();
  };

  return (
    <div className="p-6">
      <AppointmentHeader onAppointmentsRefresh={handleAppointmentsRefresh} />
      
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
    </div>
  );
};

export default Appointments;
