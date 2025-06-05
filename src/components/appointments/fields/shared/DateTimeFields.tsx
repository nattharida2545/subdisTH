
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn, Path } from 'react-hook-form';

// Modified to accept forms where date and time might be optional
interface DateTimeFieldsProps<T extends { date?: string; time?: string }> {
  form: UseFormReturn<T>;
  dateField?: Path<T>;
  timeField?: Path<T>;
}

export const DateTimeFields = <T extends { date?: string; time?: string }>({ 
  form, 
  dateField = 'date' as Path<T>, 
  timeField = 'time' as Path<T> 
}: DateTimeFieldsProps<T>) => {
  return (
    <>
      <FormField
        control={form.control}
        name={dateField}
        render={({ field }) => (
          <FormItem>
            <FormLabel>วันที่นัด</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name={timeField}
        render={({ field }) => (
          <FormItem>
            <FormLabel>เวลานัด</FormLabel>
            <FormControl>
              <Input type="time" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
