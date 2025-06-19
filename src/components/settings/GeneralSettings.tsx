
import React, { useEffect } from 'react';
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
import { Button } from '@/components/ui/button';
import { Building, Mail, Phone, Globe } from 'lucide-react';
import { useSettings } from '@/hooks/settings';
import { toast } from 'sonner';

interface GeneralSettingsProps {
  form: UseFormReturn<any>;
}

const GeneralSettings: React.FC<GeneralSettingsProps> = ({ form }) => {
  const { updateMultipleSettings } = useSettings('general');

  const handleSaveHospitalData = async () => {
    const formData = form.getValues();
    
    try {
      const hospitalSettings = [
        { category: 'general', key: 'hospital_name', value: formData.hospital_name },
        { category: 'general', key: 'hospital_address', value: formData.hospital_address },
        { category: 'general', key: 'hospital_phone', value: formData.hospital_phone || '' },
        { category: 'general', key: 'hospital_website', value: formData.hospital_website || '' },
        { category: 'general', key: 'pharmacy_name', value: formData.pharmacy_name },
        { category: 'general', key: 'pharmacy_phone', value: formData.pharmacy_phone || '' },
        { category: 'general', key: 'pharmacy_email', value: formData.pharmacy_email || '' },
      ];

      const success = await updateMultipleSettings(hospitalSettings, 'general');
      
      if (success) {
        toast.success('บันทึกข้อมูลโรงพยาบาลเรียบร้อยแล้ว');
      }
    } catch (error) {
      console.error('Error saving hospital data:', error);
      toast.error('ไม่สามารถบันทึกข้อมูลได้');
    }
  };

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
            name="hospital_phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>เบอร์โทรศัพท์โรงพยาบาล</FormLabel>
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
            name="hospital_website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>เว็บไซต์โรงพยาบาล</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input className="pl-10" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
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

        <div className="flex justify-end pt-4">
          <Button 
            type="button" 
            onClick={handleSaveHospitalData}
            className="bg-pharmacy-600 hover:bg-pharmacy-700"
          >
            บันทึกข้อมูลโรงพยาบาล
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GeneralSettings;
