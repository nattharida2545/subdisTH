
import * as z from 'zod';

export const createAppointmentFormSchema = z.object({
  patient_id: z.string().min(1, { message: 'กรุณาเลือกผู้ป่วย' }),
  date: z.string().min(1, { message: 'กรุณาระบุวันที่นัดหมาย' }),
  time: z.string().min(1, { message: 'กรุณาระบุเวลานัดหมาย' }),
  purpose: z.string().min(1, { message: 'กรุณาระบุวัตถุประสงค์' }),
  notes: z.string().optional(),
});

