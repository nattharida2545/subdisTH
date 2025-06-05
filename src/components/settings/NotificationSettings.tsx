import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
} from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Clock, MessageSquare } from 'lucide-react';

const NotificationSettings: React.FC<{ form: UseFormReturn<any> }> = ({ form }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-pharmacy-600" />
          การแจ้งเตือน
        </CardTitle>
        <CardDescription>
          ตั้งค่าการแจ้งเตือนผู้ป่วยผ่านช่องทางต่างๆ
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="channels">
          <TabsList className="mb-4">
            <TabsTrigger value="channels">ช่องทางการแจ้งเตือน</TabsTrigger>
            <TabsTrigger value="timing">การตั้งเวลา</TabsTrigger>
            <TabsTrigger value="templates">ข้อความ</TabsTrigger>
          </TabsList>
          
          <TabsContent value="channels" className="space-y-4">
            <FormField
              control={form.control}
              name="line_notification_enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">การแจ้งเตือนผ่าน LINE</FormLabel>
                    <FormDescription>
                      ส่งการแจ้งเตือนผ่าน LINE เมื่อมีการเรียกคิว
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="sms_notification_enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">การแจ้งเตือนผ่าน SMS</FormLabel>
                    <FormDescription>
                      ส่งการแจ้งเตือนผ่าน SMS เมื่อมีการเรียกคิว
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="appointment_notifications_enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">การแจ้งเตือนการนัดหมาย</FormLabel>
                    <FormDescription>
                      ส่งการแจ้งเตือนล่วงหน้าสำหรับการนัดหมาย
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="voice_notifications_enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">การแจ้งเตือนด้วยเสียง</FormLabel>
                    <FormDescription>
                      ประกาศเสียงเรียกคิวในพื้นที่รอคิว
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </TabsContent>
          
          <TabsContent value="timing">
            <h3 className="text-base font-medium mb-4 flex items-center">
              <Clock className="h-4 w-4 mr-2 text-pharmacy-600" />
              การตั้งเวลาแจ้งเตือนการนัดหมาย
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="notify_day_before"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">1 วันล่วงหน้า</FormLabel>
                      <FormDescription>
                        แจ้งเตือน 1 วันก่อนการนัดหมาย
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notify_hours_before"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">3 ชั่วโมงล่วงหน้า</FormLabel>
                      <FormDescription>
                        แจ้งเตือน 3 ชั่วโมงก่อนการนัดหมาย
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notify_hour_before"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">1 ชั่วโมงล่วงหน้า</FormLabel>
                      <FormDescription>
                        แจ้งเตือน 1 ชั่วโมงก่อนการนัดหมาย
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            <h3 className="text-base font-medium mt-6 mb-4">การตั้งเวลาแจ้งเตือนคิว</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="notify_queue_position"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">แจ้งเตือนตามตำแหน่งคิว</FormLabel>
                      <FormDescription>
                        แจ้งเตือนเมื่อเหลืออีก 3 คิวก่อนถึงคิวของผู้ป่วย
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notify_queue_waiting_time"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">แจ้งเตือนตามเวลารอ</FormLabel>
                      <FormDescription>
                        แจ้งเตือนเมื่อเหลือเวลารอประมาณ 10 นาที
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="templates">
            <h3 className="text-base font-medium mb-4 flex items-center">
              <MessageSquare className="h-4 w-4 mr-2 text-pharmacy-600" />
              ข้อความแจ้งเตือน
            </h3>
            <div className="space-y-4">
              <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">การตั้งค่าข้อความแจ้งเตือน</FormLabel>
                  <FormDescription>
                    ข้อความแจ้งเตือนสามารถตั้งค่าได้ในแท็บ LINE
                  </FormDescription>
                </div>
                <Button variant="outline" size="sm">แก้ไขข้อความ</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
