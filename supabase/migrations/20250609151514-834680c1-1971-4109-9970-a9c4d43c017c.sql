
-- Add SMS configuration settings to the settings table
INSERT INTO public.settings (category, key, value) VALUES 
  ('sms', 'enabled', 'false'),
  ('sms', 'api_key', '""'),
  ('sms', 'secret', '""'),
  ('sms', 'sender_name', '"Nattharida"'),
  ('sms', 'message_template', '"ท่านกำลังจะได้รับบริการในคิวถัดไป คิวหมายเลข {queueNumber} ที่ {servicePoint}"')
ON CONFLICT (category, key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = now();
