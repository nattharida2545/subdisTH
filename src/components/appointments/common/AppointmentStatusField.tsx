
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { AppointmentFormValues } from '../edit-dialog/types';

interface AppointmentStatusFieldProps {
  form: UseFormReturn<AppointmentFormValues>;
}

export const AppointmentStatusField: React.FC<AppointmentStatusFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="status"
      render={({ field }) => (
        <FormItem>
          <FormLabel>สถานะ</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="เลือกสถานะ" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="SCHEDULED">นัดหมาย</SelectItem>
              <SelectItem value="COMPLETED">เสร็จสิ้น</SelectItem>
              <SelectItem value="CANCELLED">ยกเลิก</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
