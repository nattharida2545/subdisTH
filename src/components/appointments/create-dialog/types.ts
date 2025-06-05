
import { z } from 'zod';
import { createAppointmentFormSchema } from './schema';

export type CreateAppointmentFormValues = z.infer<typeof createAppointmentFormSchema>;

