
import * as React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Medication } from '@/integrations/supabase/schema';
import { toast } from 'sonner';

export const useMedications = () => {
  const [medications, setMedications] = React.useState<Medication[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Memoize fetchMedications to prevent infinite loops
  const fetchMedications = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("[useMedications] Fetching medications from Supabase...");

      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        throw error;
      }

      console.log("[useMedications] Fetched medications:", data?.length || 0);
      setMedications(data || []);
    } catch (err: any) {
      console.error('Error fetching medications:', err);
      setError(err.message || 'Failed to fetch medications');
      toast.error('ไม่สามารถดึงข้อมูลยาและเวชภัณฑ์ได้');
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array since this function doesn't depend on any external values

  // Auto-fetch medications on mount only
  React.useEffect(() => {
    fetchMedications();
  }, [fetchMedications]);

  // Memoize addMedication to prevent recreating on every render
  const addMedication = React.useCallback(async (medicationData: Partial<Medication>) => {
    try {
      setError(null);
      
      if (!medicationData.code || !medicationData.name || !medicationData.unit) {
        throw new Error('Code, name, and unit are required fields');
      }
      
      const { data, error } = await supabase
        .from('medications')
        .insert([{
          code: medicationData.code,
          name: medicationData.name,
          description: medicationData.description,
          unit: medicationData.unit,
          stock: medicationData.stock || 0,
          min_stock: medicationData.min_stock || 0
        }])
        .select();

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setMedications(prev => [...prev, data[0]].sort((a, b) => a.name.localeCompare(b.name)));
        toast.success(`เพิ่มข้อมูลยา ${medicationData.name} เรียบร้อยแล้ว`);
        return data[0];
      }
      return null;
    } catch (err: any) {
      console.error('Error adding medication:', err);
      setError(err.message || 'Failed to add medication');
      toast.error('ไม่สามารถเพิ่มข้อมูลยาได้');
      return null;
    }
  }, []);

  // Memoize updateMedication
  const updateMedication = React.useCallback(async (id: string, medicationData: Partial<Medication>) => {
    try {
      setError(null);
      
      const { data, error } = await supabase
        .from('medications')
        .update({
          ...medicationData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setMedications(prev => prev.map(medication => 
          medication.id === id ? { ...medication, ...data[0] } : medication
        ));
        toast.success(`อัปเดตข้อมูลยา ${data[0].name} เรียบร้อยแล้ว`);
        return data[0];
      }
      return null;
    } catch (err: any) {
      console.error('Error updating medication:', err);
      setError(err.message || 'Failed to update medication');
      toast.error('ไม่สามารถอัปเดตข้อมูลยาได้');
      return null;
    }
  }, []);
  
  // Memoize updateStock
  const updateStock = React.useCallback(async (id: string, newStock: number) => {
    try {
      setError(null);
      
      const { data, error } = await supabase
        .from('medications')
        .update({ 
          stock: newStock,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setMedications(prev => prev.map(medication => 
          medication.id === id ? { ...medication, ...data[0] } : medication
        ));
        toast.success(`อัปเดตจำนวนยา ${data[0].name} เรียบร้อยแล้ว`);
        return data[0];
      }
      return null;
    } catch (err: any) {
      console.error('Error updating medication stock:', err);
      setError(err.message || 'Failed to update medication stock');
      toast.error('ไม่สามารถอัปเดตจำนวนยาได้');
      return null;
    }
  }, []);
  
  // Memoize deleteMedication
  const deleteMedication = React.useCallback(async (id: string) => {
    try {
      setError(null);
      
      const { error } = await supabase
        .from('medications')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setMedications(prev => prev.filter(medication => medication.id !== id));
      toast.success('ลบข้อมูลยาเรียบร้อยแล้ว');
      return true;
    } catch (err: any) {
      console.error('Error deleting medication:', err);
      setError(err.message || 'Failed to delete medication');
      toast.error('ไม่สามารถลบข้อมูลยาได้');
      return false;
    }
  }, []);

  return {
    medications,
    loading,
    error,
    fetchMedications,
    addMedication,
    updateMedication,
    updateStock,
    deleteMedication
  };
};
