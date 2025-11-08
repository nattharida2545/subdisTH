import { Medication } from '@/integrations/supabase/schema';

export interface MedicationFormData extends Omit<Partial<Medication>, 'image'> {
  image?: File | string | null;
}
