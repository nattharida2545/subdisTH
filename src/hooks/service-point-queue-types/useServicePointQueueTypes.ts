
import { useState, useEffect } from 'react';
import { ServicePointQueueType } from '@/integrations/supabase/schema';
import { UseServicePointQueueTypesReturn } from './types';
import {
  createFetchMappingsAction,
  createAddMappingAction,
  createRemoveMappingAction,
  createGetQueueTypesForServicePointAction,
  createGetServicePointsForQueueTypeAction
} from './actions';

export const useServicePointQueueTypes = (servicePointId?: string): UseServicePointQueueTypesReturn => {
  const [mappings, setMappings] = useState<ServicePointQueueType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Create action functions
  const fetchMappings = createFetchMappingsAction(servicePointId, setMappings, setLoading, setError);
  const addMapping = createAddMappingAction(setMappings);
  const removeMapping = createRemoveMappingAction(servicePointId, setMappings, setDeletingId);
  const getQueueTypesForServicePoint = createGetQueueTypesForServicePointAction();
  const getServicePointsForQueueType = createGetServicePointsForQueueTypeAction();

  useEffect(() => {
    fetchMappings();
  }, [servicePointId]);

  return {
    mappings,
    loading,
    error,
    deletingId,
    fetchMappings,
    addMapping,
    removeMapping,
    getQueueTypesForServicePoint,
    getServicePointsForQueueType
  };
};
