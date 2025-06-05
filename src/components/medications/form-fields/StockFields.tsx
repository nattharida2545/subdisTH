
import * as React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";
import { MedicationFormValues } from "../schemas/medicationSchema";

type Props = {
  control: Control<MedicationFormValues>;
};

const StockFields: React.FC<Props> = ({ control }) => (
  <div className="grid grid-cols-2 gap-4">
    <FormField
      control={control}
      name="stock"
      render={({ field }) => (
        <FormItem>
          <FormLabel>จำนวนคงเหลือ</FormLabel>
          <FormControl>
            <Input type="number" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={control}
      name="min_stock"
      render={({ field }) => (
        <FormItem>
          <FormLabel>จำนวนขั้นต่ำ</FormLabel>
          <FormControl>
            <Input type="number" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </div>
);

export default StockFields;
