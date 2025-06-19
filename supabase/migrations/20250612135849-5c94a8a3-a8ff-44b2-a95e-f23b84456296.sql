
-- Add appointment_id column to queues table to link queues back to their originating appointments
ALTER TABLE public.queues 
ADD COLUMN appointment_id UUID REFERENCES public.appointments(id);

-- Create index for better performance when querying by appointment_id
CREATE INDEX idx_queues_appointment_id ON public.queues(appointment_id);

-- Create a function to automatically create queue entries for today's appointments
CREATE OR REPLACE FUNCTION public.create_queues_from_appointments()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    appointment_record RECORD;
    new_queue_number INTEGER;
    queues_created INTEGER := 0;
BEGIN
    -- Loop through appointments scheduled for today that don't already have queues
    FOR appointment_record IN 
        SELECT a.* 
        FROM appointments a
        LEFT JOIN queues q ON q.appointment_id = a.id
        WHERE DATE(a.date) = CURRENT_DATE 
        AND a.status = 'SCHEDULED'
        AND q.id IS NULL
    LOOP
        -- Get the next queue number for APPOINTMENT type
        SELECT COALESCE(MAX(number), 0) + 1 
        INTO new_queue_number
        FROM queues 
        WHERE type = 'APPOINTMENT' 
        AND queue_date = CURRENT_DATE;
        
        -- Create the queue entry
        INSERT INTO queues (
            number,
            patient_id,
            type,
            status,
            queue_date,
            appointment_id,
            notes,
            created_at,
            updated_at
        ) VALUES (
            new_queue_number,
            appointment_record.patient_id,
            'APPOINTMENT',
            'WAITING',
            CURRENT_DATE,
            appointment_record.id,
            'Auto-created from appointment: ' || appointment_record.purpose,
            NOW(),
            NOW()
        );
        
        queues_created := queues_created + 1;
    END LOOP;
    
    RETURN queues_created;
END;
$$;

-- Create a function that can be called to sync appointment and queue statuses
CREATE OR REPLACE FUNCTION public.sync_appointment_queue_status()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update appointment status to COMPLETED when queue is completed
    UPDATE appointments 
    SET status = 'COMPLETED', updated_at = NOW()
    FROM queues 
    WHERE appointments.id = queues.appointment_id 
    AND queues.status = 'COMPLETED' 
    AND appointments.status = 'SCHEDULED';
    
    -- Update appointment status to CANCELLED when queue is cancelled
    UPDATE appointments 
    SET status = 'CANCELLED', updated_at = NOW()
    FROM queues 
    WHERE appointments.id = queues.appointment_id 
    AND queues.status = 'CANCELLED' 
    AND appointments.status = 'SCHEDULED';
END;
$$;
