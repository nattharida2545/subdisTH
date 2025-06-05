
-- Create a function to get patient medications with medication details
CREATE OR REPLACE FUNCTION public.get_patient_medications(p_patient_id UUID)
RETURNS SETOF json AS $$
BEGIN
  RETURN QUERY
  SELECT json_agg(
    json_build_object(
      'id', pm.id,
      'patient_id', pm.patient_id,
      'medication_id', pm.medication_id,
      'dosage', pm.dosage,
      'instructions', pm.instructions,
      'start_date', pm.start_date,
      'end_date', pm.end_date,
      'notes', pm.notes,
      'created_at', pm.created_at,
      'updated_at', pm.updated_at,
      'medication', json_build_object(
        'name', m.name,
        'description', m.description,
        'unit', m.unit
      )
    )
  )
  FROM patient_medications pm
  JOIN medications m ON pm.medication_id = m.id
  WHERE pm.patient_id = p_patient_id
  ORDER BY pm.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to add patient medication
CREATE OR REPLACE FUNCTION public.add_patient_medication(
  p_patient_id UUID,
  p_medication_id UUID,
  p_dosage TEXT,
  p_instructions TEXT DEFAULT NULL,
  p_start_date TIMESTAMPTZ DEFAULT now(),
  p_end_date TIMESTAMPTZ DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.patient_medications (
    patient_id,
    medication_id,
    dosage,
    instructions,
    start_date,
    end_date,
    notes
  ) VALUES (
    p_patient_id,
    p_medication_id,
    p_dosage,
    p_instructions,
    p_start_date,
    p_end_date,
    p_notes
  )
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to update patient medication
CREATE OR REPLACE FUNCTION public.update_patient_medication(
  p_id UUID,
  p_medication_id UUID DEFAULT NULL,
  p_dosage TEXT DEFAULT NULL,
  p_instructions TEXT DEFAULT NULL,
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
BEGIN
  UPDATE public.patient_medications
  SET
    medication_id = COALESCE(p_medication_id, medication_id),
    dosage = COALESCE(p_dosage, dosage),
    instructions = COALESCE(p_instructions, instructions),
    start_date = COALESCE(p_start_date, start_date),
    end_date = COALESCE(p_end_date, end_date),
    notes = COALESCE(p_notes, notes),
    updated_at = now()
  WHERE id = p_id;
  
  RETURN p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to delete patient medication
CREATE OR REPLACE FUNCTION public.delete_patient_medication(p_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  DELETE FROM public.patient_medications
  WHERE id = p_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
