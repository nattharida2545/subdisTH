import * as React from "react";
import { Form } from "@/components/ui/form";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Medication } from "@/integrations/supabase/schema";
import { useMedicationForm } from "../hooks/useMedicationForm";
import { useUnitOptions } from "@/hooks/useUnitOptions";
import { MedicationFormValues } from "../schemas/medicationSchema";
import {
  CodeField,
  NameField,
  DescriptionField,
  UnitField,
  StockFields,
  ImageField,
} from "../form-fields";

export interface MedicationsDialogFormProps {
  medication: Medication | null;
  medications: Medication[];
  isEditing: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addMedication: (data: any) => Promise<any>;
  updateMedication: (id: string, data: any) => Promise<any>;
}

const MedicationsDialogForm: React.FC<MedicationsDialogFormProps> = ({
  medication,
  medications,
  isEditing,
  open,
  onOpenChange,
  addMedication,
  updateMedication,
}) => {
  const { unitOptions, handleAddNewUnit } = useUnitOptions(medications);

  const handleSubmit = async (values: MedicationFormValues) => {
    try {
      if (isEditing && medication) {
        await updateMedication(medication.id, values);
      } else {
        await addMedication(values);
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving medication:", error);
    }
  };

  const { form, submitHandler } = useMedicationForm(
    medication,
    handleSubmit,
    open
  );

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submitHandler)} className="space-y-4">
        <CodeField control={form.control} />
        <NameField control={form.control} />
        <DescriptionField control={form.control} />
        <UnitField
          control={form.control}
          unitOptions={unitOptions}
          onAddNewUnit={handleAddNewUnit}
        />
        <StockFields control={form.control} />
        <ImageField control={form.control} />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel}>
            ยกเลิก
          </Button>
          <Button type="submit">บันทึก</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default MedicationsDialogForm;
