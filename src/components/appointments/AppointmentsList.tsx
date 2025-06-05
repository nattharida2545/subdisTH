
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Appointment, AppointmentStatus } from '@/integrations/supabase/schema';
import { useAppointments } from '@/hooks/appointments/useAppointments';
import { usePatients } from '@/hooks/usePatients';
import AppointmentItem from './AppointmentItem';
import EditAppointmentDialog from './edit-dialog/EditAppointmentDialog';
import { AppointmentFormValues } from './edit-dialog/types';
import DeleteAppointmentDialog from './DeleteAppointmentDialog';
import { toast } from 'sonner';

interface AppointmentsListProps {
  appointments: Appointment[];
  getPatientName: (patientId: string) => string;
  emptyMessage: string;
  iconBgColor: string;
  iconColor: string;
}

const AppointmentsList: React.FC<AppointmentsListProps> = ({
  appointments,
  getPatientName,
  emptyMessage,
  iconBgColor,
  iconColor
}) => {
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(null);
  const [dropdownKey, setDropdownKey] = useState(0);

  const { updateAppointment, deleteAppointment } = useAppointments();
  const { patients } = usePatients();

  const handleEditDialogClose = () => {
    setIsEditDialogOpen(false);
    setEditingAppointment(null);
    setDropdownKey(prev => prev + 1);
  };

  const openEditDialog = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setIsEditDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (appointmentToDelete) {
      try {
        await deleteAppointment(appointmentToDelete);
        setAppointmentToDelete(null);
        toast("การนัดถูกลบแล้ว", {
          description: "การนัดหมายถูกลบออกจากระบบเรียบร้อยแล้ว",
        });
      } catch (error) {
        console.error('Failed to delete appointment:', error);
        toast("เกิดข้อผิดพลาด", {
          description: "ไม่สามารถลบการนัดหมายได้ กรุณาลองใหม่อีกครั้ง",
          style: { backgroundColor: 'hsl(var(--destructive))', color: 'hsl(var(--destructive-foreground))' }
        });
      }
    }
  };

  const onSubmit = async (values: AppointmentFormValues) => {
    if (!editingAppointment) return;
    
    const { date, time, ...rest } = values;
    
    const combinedDate = new Date(`${date}T${time}`);
    
    try {
      const updated = await updateAppointment(editingAppointment.id, {
        ...rest,
        date: combinedDate.toISOString(),
        status: rest.status as AppointmentStatus
      });
      
      if (updated) {
        toast("อัพเดทการนัดสำเร็จ", {
          description: "ข้อมูลการนัดหมายถูกอัพเดทเรียบร้อยแล้ว",
        });
        handleEditDialogClose();
      }
    } catch (error) {
      console.error('Failed to update appointment:', error);
      toast("เกิดข้อผิดพลาด", {
          description: "ไม่สามารถอัพเดทการนัดหมายได้ กรุณาลองใหม่อีกครั้ง",
          style: { backgroundColor: 'hsl(var(--destructive))', color: 'hsl(var(--destructive-foreground))' }
      });
      handleEditDialogClose();
    }
  };

  return (
    <>
      <Card>
        <CardContent className="p-0">
          {appointments.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              {emptyMessage}
            </div>
          ) : (
            <div className="divide-y">
              {appointments.map((appointment) => (
                <AppointmentItem
                  key={appointment.id}
                  appointment={appointment}
                  getPatientName={getPatientName}
                  iconBgColor={iconBgColor}
                  iconColor={iconColor}
                  onEdit={openEditDialog}
                  onDelete={setAppointmentToDelete}
                  dropdownKey={dropdownKey}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <EditAppointmentDialog
        open={isEditDialogOpen}
        onOpenChange={handleEditDialogClose}
        appointment={editingAppointment}
        patients={patients}
        onSubmit={onSubmit}
      />

      <DeleteAppointmentDialog
        open={!!appointmentToDelete}
        onOpenChange={(open) => !open && setAppointmentToDelete(null)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
};

export default AppointmentsList;
