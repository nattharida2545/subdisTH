
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Building, Mail, Phone } from 'lucide-react';

interface GeneralSettingsProps {
  form: UseFormReturn<any>;
}

const GeneralSettings: React.FC<GeneralSettingsProps> = ({ form }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>ข้อมูลโรงพยาบาลและห้องยา</CardTitle>
        <CardDescription>
          ตั้งค่าข้อมูลพื้นฐานของโรงพยาบาลและห้องยา
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="hospital_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ชื่อโรงพยาบาล</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input className="pl-10" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="pharmacy_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ชื่อห้องยา</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input className="pl-10" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="hospital_address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ที่อยู่โรงพยาบาล</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="pharmacy_phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>เบอร์โทรศัพท์ห้องยา</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input className="pl-10" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="pharmacy_email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>อีเมลห้องยา</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input className="pl-10" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default GeneralSettings;
