
import { z } from "zod";
import { QueueAlgorithmType } from '@/utils/queueAlgorithms';

export interface FormatOption {
  value: '0' | '00' | '000';
  label: string;
  example: string;
}

export interface AlgorithmOption {
  value: QueueAlgorithmType;
  label: string;
  description: string;
}

export const formatOptions: FormatOption[] = [
  { value: '0', label: 'ไม่เติมเลข 0', example: '1, 2, 3...' },
  { value: '00', label: 'เติมเลข 0 (2 หลัก)', example: '01, 02, 03...' },
  { value: '000', label: 'เติมเลข 0 (3 หลัก)', example: '001, 002, 003...' },
];

export const algorithmOptions: AlgorithmOption[] = [
  { 
    value: QueueAlgorithmType.FIFO, 
    label: 'First In, First Out (FIFO)', 
    description: 'เรียกคิวตามลำดับการมาก่อน-หลัง' 
  },
  { 
    value: QueueAlgorithmType.PRIORITY, 
    label: 'Priority Queue', 
    description: 'เรียกคิวตามลำดับความสำคัญของประเภทคิว' 
  },
  { 
    value: QueueAlgorithmType.MULTILEVEL, 
    label: 'Multilevel Queue', 
    description: 'แบ่งกลุ่มคิวตามประเภทและจัดการแต่ละกลุ่มแยกกัน' 
  },
  { 
    value: QueueAlgorithmType.MULTILEVEL_FEEDBACK, 
    label: 'Multilevel Feedback Queue', 
    description: 'ปรับความสำคัญของคิวตามระยะเวลารอคอย' 
  },
];

// Create a consistent QueueType type that will be used throughout the application
export interface QueueTypeSchema {
  id: string;
  code: string;
  name: string;
  prefix: string;
  purpose: string;
  format: '0' | '00' | '000';
  enabled: boolean;
  algorithm: QueueAlgorithmType;
  priority: number;
}

// Define the queue settings schema
export const queueSettingsSchema = z.object({
  hospital_name: z.string().min(2, {
    message: "ชื่อโรงพยาบาลต้องมีอย่างน้อย 2 ตัวอักษร",
  }),
  hospital_address: z.string().optional(),
  hospital_phone: z.string().optional(),
  hospital_website: z.string().url().optional().or(z.literal('')),
  pharmacy_name: z.string().optional(),
  pharmacy_phone: z.string().optional(),
  pharmacy_email: z.string().email().optional().or(z.literal('')),
  
  queue_types: z.array(
    z.object({
      id: z.string(),
      code: z.string().min(1, { message: "รหัสประเภทคิวห้ามว่าง" }),
      name: z.string().min(1, { message: "ชื่อประเภทคิวห้ามว่าง" }),
      prefix: z.string().min(1, { message: "คำนำหน้าคิวห้ามว่าง" }),
      purpose: z.string().optional(),
      format: z.enum(['0', '00', '000']),
      enabled: z.boolean().default(true),
      algorithm: z.nativeEnum(QueueAlgorithmType).default(QueueAlgorithmType.FIFO),
      priority: z.number().min(0).max(10).default(0)
    })
  ),
  
  queue_reset_daily: z.boolean().default(true),
  queue_start_number: z.coerce.number().int().positive().default(1),
  queue_algorithm: z.nativeEnum(QueueAlgorithmType).default(QueueAlgorithmType.FIFO),
  enable_wait_time_prediction: z.boolean().default(true),
  
  queue_announcement_enabled: z.boolean().default(true),
  queue_announcement_text: z.string().min(5).default('ขอเชิญหมายเลข {queueNumber} ที่ช่องบริการ {counter}'),
  queue_voice_enabled: z.boolean().default(true),
  queue_voice_speed: z.coerce.number().min(0.5).max(2).default(0.8),
  queue_voice_pitch: z.coerce.number().min(0.5).max(2).default(1),
  
  line_notification_enabled: z.boolean().default(true),
  sms_notification_enabled: z.boolean().default(false),
  appointment_notifications_enabled: z.boolean().default(true),
  voice_notifications_enabled: z.boolean().default(true),
  notify_day_before: z.boolean().default(true),
  notify_hours_before: z.boolean().default(true),
  notify_hour_before: z.boolean().default(false),
  notify_queue_position: z.boolean().default(true),
  notify_queue_waiting_time: z.boolean().default(true),
});

// Add the missing initial queue types
export const initialQueueTypes = [
  {
    id: 'REGULAR',
    code: 'GENERAL',
    name: 'ทั่วไป',
    prefix: 'A',
    purpose: 'สำหรับผู้ป่วยทั่วไป',
    format: '00' as const,
    enabled: true,
    algorithm: QueueAlgorithmType.FIFO,
    priority: 5
  },
  {
    id: 'ELDERLY',
    code: 'ELDERLY',
    name: 'ผู้สูงอายุ',
    prefix: 'E',
    purpose: 'สำหรับผู้สูงอายุ 60 ปีขึ้นไป',
    format: '00' as const,
    enabled: true,
    algorithm: QueueAlgorithmType.PRIORITY,
    priority: 7
  },
  {
    id: 'URGENT',
    code: 'URGENT',
    name: 'ด่วน',
    prefix: 'U',
    purpose: 'สำหรับกรณีเร่งด่วน',
    format: '00' as const,
    enabled: true,
    algorithm: QueueAlgorithmType.PRIORITY,
    priority: 10
  },
  {
    id: 'SPECIAL',
    code: 'SPECIAL',
    name: 'ยาพิเศษ',
    prefix: 'S',
    purpose: 'ยาที่ต้องเตรียมพิเศษ',
    format: '00' as const,
    enabled: true,
    algorithm: QueueAlgorithmType.MULTILEVEL,
    priority: 8
  }
];

export type SettingsFormValues = z.infer<typeof queueSettingsSchema>;
