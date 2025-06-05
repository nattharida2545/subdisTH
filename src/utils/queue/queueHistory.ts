
import { supabase } from '@/integrations/supabase/client';

// Get queue history for a patient
export const getPatientQueueHistory = async (patientId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('queues')
      .select(`
        *,
        service_point:service_points(id, name)
      `)
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error getting patient queue history:', error);
    return [];
  }
};

// Get service point details with queue type capabilities
export const getServicePointDetails = async (servicePointId: string): Promise<any> => {
  try {
    // Get service point details
    const { data: servicePoint, error: servicePointError } = await supabase
      .from('service_points')
      .select('*')
      .eq('id', servicePointId)
      .single();
      
    if (servicePointError) {
      throw servicePointError;
    }
    
    if (!servicePoint) {
      throw new Error('Service point not found');
    }
    
    // Get queue types that this service point can handle
    const { data: queueTypeCapabilities, error: capabilitiesError } = await supabase
      .from('service_point_queue_types')
      .select(`
        queue_type:queue_types(*)
      `)
      .eq('service_point_id', servicePointId);
      
    if (capabilitiesError) {
      throw capabilitiesError;
    }
    
    const queueTypes = queueTypeCapabilities?.map(item => item.queue_type) || [];
    
    return {
      ...servicePoint,
      queueTypes
    };
  } catch (error) {
    console.error('Error getting service point details:', error);
    return null;
  }
};
