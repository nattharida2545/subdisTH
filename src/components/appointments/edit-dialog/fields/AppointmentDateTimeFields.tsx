
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { AppointmentFormValues } from '../types';
import { DateTimeFields } from '../../fields/shared/DateTimeFields';

interface AppointmentDateTimeFieldsProps {
  form: UseFormReturn<AppointmentFormValues>;
}

export const AppointmentDateTimeFields = ({ form }: AppointmentDateTimeFieldsProps) => {
  return <DateTimeFields form={form} />;
};
