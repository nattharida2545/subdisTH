
-- Add APPOINTMENT queue type to the queue_types table
INSERT INTO public.queue_types (
  code,
  name,
  prefix,
  purpose,
  format,
  enabled,
  algorithm,
  priority
) VALUES (
  'APPOINTMENT',
  'นัดหมาย',
  'A',
  'สำหรับผู้ป่วยที่มีการนัดหมาย',
  '00',
  true,
  'FIFO',
  6
) ON CONFLICT (code) DO NOTHING;
