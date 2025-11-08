import { supabase } from '@/integrations/supabase/client';
import { ServicePointIns } from '@/integrations/supabase/schema';
import { createLogger } from '@/utils/logger';

const logger = createLogger('servicePointInsUtils');

export const getServicePointInsById = async (servicePointId: string): Promise<ServicePointIns | null> => {
  try {
    const { data, error } = await supabase
      .from('service_points_ins')
      .select('*')
      .eq('id', servicePointId)
      .single();

    if (error) {
      logger.error('Error fetching INS service point:', error);
      return null;
    }

    return data;
  } catch (error) {
    logger.error('Error in getServicePointInsById:', error);
    return null;
  }
};
