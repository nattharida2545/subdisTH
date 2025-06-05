
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { createLogger } from '@/utils/logger';
import { ServicePointQueueType } from '@/integrations/supabase/schema';
import { 
  fetchServicePointQueueTypes, 
  createServicePointQueueTypeMapping, 
  deleteServicePointQueueTypeMapping,
  getQueueTypesForServicePoint as getQueueTypesService,
  getServicePointsForQueueType as getServicePointsService
} from './service';

const logger = createLogger('ServicePointQueueTypesActions');

export const createFetchMappingsAction = (
  servicePointId: string | undefined,
  setMappings: (mappings: ServicePointQueueType[]) => void,
  setLoading: (loading: boolean) => void,
  setError: (error: string | null) => void
) => {
  return async () => {
    // Don't fetch if no service point is selected
    if (!servicePointId) {
      setMappings([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await fetchServicePointQueueTypes(servicePointId);
      setMappings(data);
    } catch (err: any) {
      logger.error('Error fetching service point queue type mappings:', err);
      setError(err.message || 'Failed to fetch service point queue type mappings');
      setMappings([]);
    } finally {
      setLoading(false);
    }
  };
};

export const createAddMappingAction = (
  setMappings: (updater: (prev: ServicePointQueueType[]) => ServicePointQueueType[]) => void
) => {
  return async (servicePointId: string, queueTypeId: string): Promise<ServicePointQueueType | null> => {
    try {
      const newMapping = await createServicePointQueueTypeMapping(servicePointId, queueTypeId);
      setMappings(prev => [...prev, newMapping]);
      toast.success('เพิ่มการเชื่อมโยงประเภทคิวกับจุดบริการเรียบร้อยแล้ว');
      return newMapping;
    } catch (err: any) {
      logger.error('Error adding service point queue type mapping:', err);
      toast.error('ไม่สามารถเพิ่มการเชื่อมโยงประเภทคิวกับจุดบริการได้');
      return null;
    }
  };
};

export const createRemoveMappingAction = (
  servicePointId: string | undefined,
  setMappings: (updater: (prev: ServicePointQueueType[]) => ServicePointQueueType[]) => void,
  setDeletingId: (id: string | null) => void
) => {
  return async (id: string): Promise<boolean> => {
    try {
      setDeletingId(id);
      
      // Always remove from local state first for immediate UI feedback
      setMappings(prev => {
        const updated = prev.filter(mapping => mapping.id !== id);
        logger.debug(`Optimistically removed mapping ${id} from local state, remaining: ${updated.length}`);
        return updated;
      });

      const deleted = await deleteServicePointQueueTypeMapping(id);
      
      if (deleted) {
        toast.success('ลบการเชื่อมโยงประเภทคิวกับจุดบริการเรียบร้อยแล้ว');
        logger.debug(`Successfully deleted mapping with id: ${id}`);
      } else {
        // Record didn't exist in database, but we already removed it from UI
        toast.success('ลบการเชื่อมโยงประเภทคิวกับจุดบริการเรียบร้อยแล้ว');
        logger.debug(`Mapping ${id} was already removed or didn't exist in database`);
      }
      
      return true;
    } catch (err: any) {
      logger.error('Error removing service point queue type mapping:', err);
      
      // Restore the item to local state if deletion failed
      if (servicePointId) {
        try {
          const allMappings = await fetchServicePointQueueTypes(servicePointId);
          setMappings(() => allMappings);
        } catch (refetchError) {
          logger.error('Failed to refetch mappings after deletion error:', refetchError);
        }
      }
      
      toast.error(`ไม่สามารถลบการเชื่อมโยงประเภทคิวกับจุดบริการได้: ${err.message}`);
      return false;
    } finally {
      setDeletingId(null);
    }
  };
};

export const createGetQueueTypesForServicePointAction = () => {
  return async (servicePointId: string) => {
    try {
      return await getQueueTypesService(servicePointId);
    } catch (err: any) {
      logger.error('Error fetching queue types for service point:', err);
      toast.error('ไม่สามารถดึงข้อมูลประเภทคิวสำหรับจุดบริการได้');
      return [];
    }
  };
};

export const createGetServicePointsForQueueTypeAction = () => {
  return async (queueTypeId: string) => {
    try {
      return await getServicePointsService(queueTypeId);
    } catch (err: any) {
      logger.error('Error fetching service points for queue type:', err);
      toast.error('ไม่สามารถดึงข้อมูลจุดบริการสำหรับประเภทคิวได้');
      return [];
    }
  };
};

// New action to fetch ALL mappings across all service points
export const createFetchAllMappingsAction = () => {
  return async (): Promise<ServicePointQueueType[]> => {
    try {
      logger.debug('Fetching all service point queue type mappings');
      
      const { data, error } = await supabase
        .from('service_point_queue_types')
        .select(`
          *,
          queue_type:queue_types(id, name, code),
          service_point:service_points(id, name, code)
        `);

      if (error) {
        logger.error('Supabase error during fetch all mappings:', error);
        throw error;
      }

      logger.debug(`Successfully fetched ${data?.length || 0} total mappings:`, data);
      return data || [];
    } catch (err: any) {
      logger.error('Error fetching all service point queue type mappings:', err);
      return [];
    }
  };
};
