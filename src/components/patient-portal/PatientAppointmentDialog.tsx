
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Patient } from '@/integrations/supabase/schema';
import { toast } from 'sonner';

const appointmentSchema = z.object({
  date: z.string().min(1, 'กรุณาระบุวันที่นัดหมาย'),
  time: z.string().min(1, 'กรุณาระบุเวลานัดหมาย'),
  purpose: z.string().min(1, 'กรุณาระบุวัตถุประสงค์'),
  notes: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

interface AppointmentData {
  id: string;
  patient_id: string;
  date: string;
  purpose: string;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface PatientAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient;
  appointment?: AppointmentData | null;
  onSuccess: () => void;
}

const PatientAppointmentDialog: React.FC<PatientAppointmentDialogProps> = ({
  open,
  onOpenChange,
  patient,
  appointment,
  onSuccess,
}) => {
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      date: appointment ? format(new Date(appointment.date), 'yyyy-MM-dd') : '',
      time: appointment ? format(new Date(appointment.date), 'HH:mm') : '',
      purpose: appointment?.purpose || '',
      notes: appointment?.notes || '',
    },
  });

  React.useEffect(() => {
    if (appointment) {
      const appointmentDate = new Date(appointment.date);
      form.reset({
        date: format(appointmentDate, 'yyyy-MM-dd'),
        time: format(appointmentDate, 'HH:mm'),
        purpose: appointment.purpose,
        notes: appointment.notes || '',
      });
    } else {
      form.reset({
        date: '',
        time: '',
        purpose: '',
        notes: '',
      });
    }
  }, [appointment, form]);

  const onSubmit = async (values: AppointmentFormValues) => {
    try {
      const appointmentDateTime = new Date(`${values.date}T${values.time}`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check if appointment is for future date (not today)
      if (appointmentDateTime.toDateString() === today.toDateString()) {
        toast.error('ไม่สามารถนัดหมายในวันนี้ได้ กรุณาเลือกวันที่ในอนาคต');
        return;
      }

      if (appointmentDateTime <= today) {
        toast.error('กรุณาเลือกวันที่ในอนาคต');
        return;
      }

      const appointmentData = {
        patient_id: patient.id,
        date: appointmentDateTime.toISOString(),
        purpose: values.purpose,
        notes: values.notes || null,
        status: 'SCHEDULED' as const,
      };

      if (appointment) {
        // Update existing appointment
        const { error } = await supabase
          .from('appointments')
          .update(appointmentData)
          .eq('id', appointment.id);

        if (error) throw error;
        toast.success('แก้ไขนัดหมายเรียบร้อยแล้ว');
      } else {
        // Create new appointment
        const { error } = await supabase
          .from('appointments')
          .insert(appointmentData);

        if (error) throw error;
        toast.success('สร้างนัดหมายเรียบร้อยแล้ว');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving appointment:', error);
      toast.error('เกิดข้อผิดพลาดในการบันทึกนัดหมาย');
    }
  };

  // Get tomorrow's date as minimum selectable date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = format(tomorrow, 'yyyy-MM-dd');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {appointment ? 'แก้ไขนัดหมาย' : 'สร้างนัดหมายใหม่'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>วันที่นัด</FormLabel>
                    <FormControl>
                      <Input type="date" min={minDate} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>เวลานัด</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>วัตถุประสงค์</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="เช่น ตรวจสุขภาพ, รับยา, ติดตามอาการ" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>หมายเหตุ (ไม่บังคับ)</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="รายละเอียดเพิ่มเติม..." rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                ยกเลิก
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                {appointment ? 'บันทึกการแก้ไข' : 'สร้างนัดหมาย'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PatientAppointmentDialog;
