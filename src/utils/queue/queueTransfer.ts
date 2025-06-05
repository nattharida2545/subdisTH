
import { supabase } from '@/integrations/supabase/client';

// Transfer a queue from one service point to another
export const transferQueue = async (
  queueId: string, 
  sourceServicePointId: string,
  targetServicePointId: string,
  notes?: string,
  newQueueType?: string
): Promise<boolean> => {
  try {
    const now = new Date().toISOString();
    
    // Complete the queue at the current service point
    const { error: completeError } = await supabase
      .from('queues')
      .update({
        status: 'COMPLETED',
        completed_at: now,
        transferred_at: now,
        transferred_to_service_point_id: targetServicePointId,
        notes: notes ? `${notes} (Transferred to another service point)` : 'Transferred to another service point'
      })
      .eq('id', queueId)
      .eq('service_point_id', sourceServicePointId);
      
    if (completeError) {
      throw completeError;
    }
    
    // Get the queue details to create a new queue at the target service point
    const { data: queueData, error: queueError } = await supabase
      .from('queues')
      .select('number, patient_id, type, notes')
      .eq('id', queueId)
      .single();
      
    if (queueError) {
      throw queueError;
    }
    
    if (!queueData) {
      throw new Error('Queue not found');
    }
    
    // Create a new queue at the target service point
    const { error: createError } = await supabase
      .from('queues')
      .insert({
        number: queueData.number, // Keep the same queue number
        patient_id: queueData.patient_id,
        type: newQueueType || queueData.type, // Use new queue type if provided
        status: 'WAITING',
        service_point_id: targetServicePointId,
        notes: notes ? `${notes} (Transferred from another service point)` : 'Transferred from another service point'
      });
      
    if (createError) {
      throw createError;
    }
    
    return true;
  } catch (error) {
    console.error('Error transferring queue:', error);
    return false;
  }
};

// Hold a queue
export const holdQueue = async (
  queueId: string, 
  servicePointId: string,
  reason?: string
): Promise<boolean> => {
  try {
    // Change status to WAITING (from ACTIVE)
    const { error } = await supabase
      .from('queues')
      .update({
        status: 'WAITING',
        paused_at: new Date().toISOString(),
        // Don't clear called_at to preserve the original call time
        notes: reason ? `[HOLD] ${reason}` : '[HOLD] Queue temporarily on hold'
      })
      .eq('id', queueId)
      .eq('service_point_id', servicePointId)
      .eq('status', 'ACTIVE');
      
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error holding queue:', error);
    return false;
  }
};

// Return a skipped queue to waiting status
export const returnSkippedQueue = async (
  queueId: string
): Promise<boolean> => {
  try {
    // Change status from SKIPPED to WAITING
    const { error } = await supabase
      .from('queues')
      .update({
        status: 'WAITING',
        skipped_at: null, // Clear the skipped_at timestamp
        notes: '[RETURNED] Previously skipped queue returned to waiting'
      })
      .eq('id', queueId)
      .eq('status', 'SKIPPED');
      
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error returning skipped queue:', error);
    return false;
  }
};
