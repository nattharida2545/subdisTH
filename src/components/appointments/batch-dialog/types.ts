
import { z } from 'zod';

export const batchAppointmentFormSchema = z.object({
  date: z.string().min(1, { message: 'กรุณาระบุวันที่' }),
  startTime: z.string().min(1, { message: 'กรุณาระบุเวลา' }),
  duration: z.number().min(5, { message: 'ระยะเวลาต้องอย่างน้อย 5 นาที' }).max(60, { message: 'ระยะเวลาไม่ควรเกิน 60 นาที' }).default(15),
  purpose: z.string().min(1, { message: 'กรุณาระบุจุดประสงค์การนัด' }),
  notes: z.string().optional(),
});

export type BatchAppointmentFormValues = z.infer<typeof batchAppointmentFormSchema>;

export interface TimeSlot {
  patientId: string;
  time: string;
}
