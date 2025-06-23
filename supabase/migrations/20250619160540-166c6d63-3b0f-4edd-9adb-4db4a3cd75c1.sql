
-- Drop existing RLS policies for service_point_queue_types table
DROP POLICY IF EXISTS "Staff can view service point queue types" ON public.service_point_queue_types;
DROP POLICY IF EXISTS "Staff can create service point queue types" ON public.service_point_queue_types;
DROP POLICY IF EXISTS "Staff can update service point queue types" ON public.service_point_queue_types;
DROP POLICY IF EXISTS "Staff can delete service point queue types" ON public.service_point_queue_types;

-- Create new policies that allow public access
CREATE POLICY "Allow public read access to service point queue types" ON public.service_point_queue_types
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to service point queue types" ON public.service_point_queue_types
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to service point queue types" ON public.service_point_queue_types
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access to service point queue types" ON public.service_point_queue_types
  FOR DELETE USING (true);
