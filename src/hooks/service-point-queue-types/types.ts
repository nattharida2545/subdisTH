
import { ServicePointQueueType } from '@/integrations/supabase/schema';

export interface ServicePointQueueTypesState {
  mappings: ServicePointQueueType[];
  loading: boolean;
  error: string | null;
  deletingId: string | null;
}

export interface ServicePointQueueTypesActions {
  fetchMappings: () => Promise<void>;
  addMapping: (servicePointId: string, queueTypeId: string) => Promise<ServicePointQueueType | null>;
  removeMapping: (id: string) => Promise<boolean>;
  getQueueTypesForServicePoint: (servicePointId: string) => Promise<any[]>;
  getServicePointsForQueueType: (queueTypeId: string) => Promise<any[]>;
}

export interface UseServicePointQueueTypesReturn extends ServicePointQueueTypesState, ServicePointQueueTypesActions {}
