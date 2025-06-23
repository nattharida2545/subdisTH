
-- Add RLS policies for service_point_queue_types table to allow staff/admin access
-- First, check if RLS is enabled and add policies

-- Enable RLS if not already enabled
ALTER TABLE public.service_point_queue_types ENABLE ROW LEVEL SECURITY;

-- Create policies for service_point_queue_types table
-- Allow staff and admin to view all mappings
CREATE POLICY "Staff can view service point queue types" ON public.service_point_queue_types
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'staff')
  );

-- Allow staff and admin to create mappings
CREATE POLICY "Staff can create service point queue types" ON public.service_point_queue_types
  FOR INSERT WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'staff')
  );

-- Allow staff and admin to update mappings
CREATE POLICY "Staff can update service point queue types" ON public.service_point_queue_types
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'staff')
  );

-- Allow staff and admin to delete mappings
CREATE POLICY "Staff can delete service point queue types" ON public.service_point_queue_types
  FOR DELETE USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'staff')
  );
