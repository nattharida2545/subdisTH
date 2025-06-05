
import * as React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";
import { MedicationFormValues } from "../schemas/medicationSchema";

type Props = {
  control: Control<MedicationFormValues>;
};

const CodeField: React.FC<Props> = ({ control }) => (
  <FormField
    control={control}
    name="code"
    render={({ field }) => (
      <FormItem>
        <FormLabel>รหัสยา</FormLabel>
        <FormControl>
          <Input {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

export default CodeField;
