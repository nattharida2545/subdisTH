
-- Drop the existing check constraint that doesn't include APPOINTMENT
ALTER TABLE public.queues DROP CONSTRAINT IF EXISTS queues_type_check;

-- Create a new check constraint that includes APPOINTMENT
ALTER TABLE public.queues ADD CONSTRAINT queues_type_check 
CHECK (type IN ('GENERAL', 'PRIORITY', 'ELDERLY', 'FOLLOW_UP', 'URGENT', 'SPECIAL', 'APPOINTMENT'));
