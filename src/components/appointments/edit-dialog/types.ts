
import { z } from 'zod';
import { appointmentFormSchema } from './schema';

export type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;
