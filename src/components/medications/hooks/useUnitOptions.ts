
import * as React from 'react';
import { Medication } from '@/integrations/supabase/schema';
import { toast } from 'sonner';

export const useUnitOptions = (medications: Medication[] | null | undefined) => {
  const [newUnitInput, setNewUnitInput] = React.useState('');
  const [openUnitPopover, setOpenUnitPopover] = React.useState(false);
  
  const unitOptions = React.useMemo(() => {
    try {
      // Ensure medications is an array, if not return empty array
      if (!medications || !Array.isArray(medications)) {
        return [];
      }

      // Filter out invalid units and create unique set
      const uniqueUnits = new Set(
        medications
          .filter(med => med && typeof med.unit === 'string')
          .map(med => med.unit)
          .filter(unit => unit.length > 0)
      );

      // Convert set to array of option objects
      return Array.from(uniqueUnits).map(unit => ({
        value: unit,
        label: unit
      }));
    } catch (error) {
      console.error('Error processing medication units:', error);
      return [];
    }
  }, [medications]);

  const handleAddNewUnit = (setValue: (value: string) => void) => {
    try {
      if (!newUnitInput || newUnitInput.trim() === '') {
        toast.error('กรุณาระบุหน่วยยา');
        return;
      }

      const trimmedUnit = newUnitInput.trim();
      setValue(trimmedUnit);
      setOpenUnitPopover(false);
      setNewUnitInput('');
    } catch (error) {
      console.error('Error adding new unit:', error);
      toast.error('ไม่สามารถเพิ่มหน่วยยาได้');
    }
  };

  return {
    newUnitInput,
    setNewUnitInput,
    openUnitPopover,
    setOpenUnitPopover,
    unitOptions,
    handleAddNewUnit
  };
};
