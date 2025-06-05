
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Medication } from '@/integrations/supabase/schema';
import { medicationFormSchema, MedicationFormValues } from '../schemas/medicationSchema';

export const useMedicationForm = (
  medication: Medication | null,
  onSubmit: (values: MedicationFormValues) => Promise<void>,
  open: boolean
) => {
  const form = useForm<MedicationFormValues>({
    resolver: zodResolver(medicationFormSchema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      unit: '',
      stock: 0,
      min_stock: 0,
    },
  });

  React.useEffect(() => {
    if (open) {
      if (medication) {
        form.reset({
          code: medication.code,
          name: medication.name,
          description: medication.description || '',
          unit: medication.unit,
          stock: medication.stock,
          min_stock: medication.min_stock,
        });
      } else {
        form.reset({
          code: '',
          name: '',
          description: '',
          unit: '',
          stock: 0,
          min_stock: 0,
        });
      }
    }
  }, [open, medication, form]);

  const submitHandler = async (data: MedicationFormValues) => {
    // Ensure numbers are numbers, not strings
    const payload = {
      ...data,
      stock: Number(data.stock) || 0,
      min_stock: Number(data.min_stock) || 0,
    };
    await onSubmit(payload);
  };

  return {
    form,
    submitHandler,
  };
};
