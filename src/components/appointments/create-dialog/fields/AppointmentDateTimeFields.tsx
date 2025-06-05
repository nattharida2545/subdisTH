
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { CreateAppointmentFormValues } from '../types';
import { DateTimeFields } from '../../fields/shared/DateTimeFields';

interface AppointmentDateTimeFieldsProps {
  form: UseFormReturn<CreateAppointmentFormValues>;
}

export const AppointmentDateTimeFields: React.FC<AppointmentDateTimeFieldsProps> = ({ form }) => {
  return <DateTimeFields form={form} />;
};
