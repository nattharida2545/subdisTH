
import { useAppointmentState } from './useAppointmentState';
import { useAppointmentActions } from './useAppointmentActions';
import { useAppointmentDateRange } from './useAppointmentDateRange';

export const useAppointments = () => {
  const { appointments, setAppointments, loading, error, fetchAppointments } = useAppointmentState();
  const { addAppointment, updateAppointment, deleteAppointment } = useAppointmentActions(setAppointments);
  const { getAppointmentsByDateRange } = useAppointmentDateRange();

  return {
    appointments,
    loading,
    error,
    fetchAppointments,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    getAppointmentsByDateRange
  };
};

export default useAppointments;
