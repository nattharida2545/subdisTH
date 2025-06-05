
import * as React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Control } from "react-hook-form";
import { MedicationFormValues } from "../schemas/medicationSchema";

type Props = {
  control: Control<MedicationFormValues>;
};

const DescriptionField: React.FC<Props> = ({ control }) => (
  <FormField
    control={control}
    name="description"
    render={({ field }) => (
      <FormItem>
        <FormLabel>คำอธิบาย</FormLabel>
        <FormControl>
          <Textarea {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

export default DescriptionField;
