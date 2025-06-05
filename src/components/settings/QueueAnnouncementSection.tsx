import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Volume2 } from 'lucide-react';
import { announceQueue } from '@/utils/textToSpeech';

interface QueueAnnouncementSectionProps {
  form: UseFormReturn<any>;
}

const QueueAnnouncementSection: React.FC<QueueAnnouncementSectionProps> = ({ form }) => {
  const testVoiceAnnouncement = () => {
    const counter = form.getValues('counter_name') || '1';
    
    // Get settings from form values
    const volume = form.getValues('queue_voice_volume') / 100 || 0.8;
    const rate = form.getValues('queue_voice_rate') / 100 || 0.9;
    
    // Save settings to localStorage for the actual queue operations
    localStorage.setItem('queue_voice_volume', String(form.getValues('queue_voice_volume') || 80));
    localStorage.setItem('queue_voice_rate', String(form.getValues('queue_voice_rate') || 90));
    localStorage.setItem('counter_name', counter);
    localStorage.setItem('queue_voice_enabled', String(form.getValues('queue_voice_enabled') || true));
    
    // Create proper service point object for testing with sample data
    const testServicePointInfo = {
      code: 'SP01', // This will be converted to "เอส พี ศูนย์ หนึ่ง"
      name: 'เซอร์วิสพอยท์ หนึ่ง'
    };
    
    // Test with sample queue number and service point object
    announceQueue(123, testServicePointInfo, 'GENERAL');
  };

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="queue_announcement_text"
        render={({ field }) => (
          <FormItem>
            <FormLabel>ข้อความประกาศเรียกคิว</FormLabel>
            <FormControl>
              <Textarea {...field} />
            </FormControl>
            <FormDescription>
              ใช้ {'{queueNumber}'} สำหรับหมายเลขคิว, {'{counter}'} สำหรับช่องบริการ และ {'{queueType}'} สำหรับประเภทคิว
            </FormDescription>
            <FormMessage />
            <div className="mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                type="button" 
                onClick={testVoiceAnnouncement}
                className="flex items-center gap-1"
              >
                <Volume2 className="h-4 w-4" />
                ทดสอบเสียงประกาศ
              </Button>
            </div>
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="queue_voice_enabled"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">เปิดใช้งานเสียงเรียกคิว</FormLabel>
              <FormDescription>
                ระบบจะประกาศเสียงเมื่อมีการเรียกคิว
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
      
      {form.watch('queue_voice_enabled') && (
        <>
          <FormField
            control={form.control}
            name="queue_voice_volume"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ระดับเสียง</FormLabel>
                <FormControl>
                  <Slider
                    defaultValue={[field.value || 80]}
                    max={100}
                    step={1}
                    onValueChange={(value) => field.onChange(value[0])}
                  />
                </FormControl>
                <FormDescription>
                  ปรับระดับความดังของเสียงประกาศ
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="queue_voice_rate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ความเร็วในการพูด</FormLabel>
                <FormControl>
                  <Slider
                    defaultValue={[field.value || 90]}
                    max={200}
                    min={50}
                    step={5}
                    onValueChange={(value) => field.onChange(value[0])}
                  />
                </FormControl>
                <FormDescription>
                  ปรับความเร็วในการอ่านข้อความ (ค่าปกติ = 100)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="counter_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ชื่อช่องบริการ</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="ช่องบริการ 1" />
                </FormControl>
                <FormDescription>
                  ระบุชื่อช่องบริการที่จะใช้ในการประกาศเสียง
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
    </div>
  );
};

export default QueueAnnouncementSection;
