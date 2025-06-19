
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Patient } from '@/integrations/supabase/schema';
import { toast } from 'sonner';

const profileSchema = z.object({
  name: z.string().min(1, 'กรุณาระบุชื่อ'),
  phone: z.string().min(1, 'กรุณาระบุหมายเลขโทรศัพท์'),
  address: z.string().optional(),
  gender: z.string().optional(),
  birth_date: z.string().optional(),
  distance_from_hospital: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface PatientProfileProps {
  patient: Patient;
}

const PatientProfile: React.FC<PatientProfileProps> = ({ patient }) => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: patient.name || '',
      phone: patient.phone || '',
      address: patient.address || '',
      gender: patient.gender || '',
      birth_date: patient.birth_date || '',
      distance_from_hospital: patient.distance_from_hospital?.toString() || '',
    },
  });

  const onSubmit = async (values: ProfileFormValues) => {
    setSaving(true);
    try {
      const updateData = {
        name: values.name,
        phone: values.phone,
        address: values.address || null,
        gender: values.gender || null,
        birth_date: values.birth_date || null,
        distance_from_hospital: values.distance_from_hospital 
          ? parseFloat(values.distance_from_hospital) 
          : null,
      };

      const { error } = await supabase
        .from('patients')
        .update(updateData)
        .eq('id', patient.id);

      if (error) throw error;

      // Update phone in localStorage if changed
      if (values.phone !== patient.phone) {
        localStorage.setItem('userPhone', values.phone);
      }

      toast.success('บันทึกข้อมูลเรียบร้อยแล้ว');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/patient-portal')}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">แก้ไขข้อมูลส่วนตัว</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              ข้อมูลส่วนตัว
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ชื่อ-นามสกุล</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="กรุณาระบุชื่อ-นามสกุล" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>หมายเลขโทรศัพท์</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="กรุณาระบุหมายเลขโทรศัพท์" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>เพศ</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="เลือกเพศ" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ชาย">ชาย</SelectItem>
                            <SelectItem value="หญิง">หญิง</SelectItem>
                            <SelectItem value="ไม่ระบุ">ไม่ระบุ</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="birth_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>วันเกิด</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ที่อยู่</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="กรุณาระบุที่อยู่" rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="distance_from_hospital"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ระยะทางจากโรงพยาบาล (กิโลเมตร)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          min="0"
                          {...field} 
                          placeholder="เช่น 5.2" 
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-sm text-gray-500 mt-1">
                        ข้อมูลนี้จะใช้สำหรับคำนวณลำดับคิวในกรณีที่มีการนัดหมาย
                      </p>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/patient-portal')}
                  >
                    ยกเลิก
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={saving}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PatientProfile;
