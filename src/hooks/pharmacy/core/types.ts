
import { Patient, QueueTypeEnum, QueueStatus } from '@/integrations/supabase/schema';
import * as z from 'zod';

// Enhanced service status with strict typing
export const PharmacyServiceStatusSchema = z.enum(['IN_PROGRESS', 'COMPLETED', 'FORWARDED']);
export type PharmacyServiceStatus = z.infer<typeof PharmacyServiceStatusSchema>;

// Enhanced pharmacy service interface
export const PharmacyServiceSchema = z.object({
  id: z.string().uuid(),
  queue_id: z.string().uuid(),
  pharmacist_notes: z.string().nullable().optional(),
  service_start_at: z.string(),
  service_end_at: z.string().nullable().optional(),
  forwarded_to: z.string().nullable().optional(),
  status: PharmacyServiceStatusSchema,
  created_at: z.string(),
  updated_at: z.string()
});

export type PharmacyService = z.infer<typeof PharmacyServiceSchema>;

// Enhanced pharmacy queue interface - using string enums for proper validation
export const PharmacyQueueSchema = z.object({
  id: z.string().uuid(),
  number: z.number().int().positive(),
  patient_id: z.string().uuid(),
  type: z.string(), // Use string instead of nativeEnum for better compatibility
  status: z.string(), // Use string instead of nativeEnum for better compatibility
  notes: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  called_at: z.string().optional(),
  completed_at: z.string().optional(),
  queue_date: z.string().optional(),
  patient: z.custom<Patient>().optional(),
  service: PharmacyServiceSchema.optional()
});

export type PharmacyQueue = z.infer<typeof PharmacyQueueSchema>;

// Action result types
export interface PharmacyActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Service action parameters
export interface CompleteServiceParams {
  queueId: string;
  notes?: string;
}

export interface ForwardServiceParams {
  queueId: string;
  forwardTo: string;
  notes?: string;
}

export interface CallQueueParams {
  servicePointId: string;
}

// Validation functions with proper error handling
export const validatePharmacyQueue = (data: unknown): PharmacyQueue => {
  try {
    return PharmacyQueueSchema.parse(data);
  } catch (error) {
    console.error('PharmacyQueue validation failed:', error);
    // Return a safe fallback or throw with better context
    throw new Error(`Invalid pharmacy queue data: ${error}`);
  }
};

export const validatePharmacyService = (data: unknown): PharmacyService => {
  try {
    return PharmacyServiceSchema.parse(data);
  } catch (error) {
    console.error('PharmacyService validation failed:', error);
    throw new Error(`Invalid pharmacy service data: ${error}`);
  }
};
