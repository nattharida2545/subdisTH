import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { createLogger } from '@/utils/logger';
import { toast } from 'sonner';

const logger = createLogger('SimulationCSVExport');

export const useSimulationCSVExport = () => {
  const exportSimulationData = useCallback(async () => {
    try {
      logger.info('🔽 Starting CSV export of simulation data...');
      
      // Fetch all simulation queues with their related data
      const { data: queues, error } = await supabase
        .from('queues')
        .select(`
          *,
          patients(name, phone, patient_id),
          service_points(name, code)
        `)
        .like('notes', '%ข้อมูลจำลองโรงพยาบาล%')
        .order('created_at', { ascending: true });

      if (error) {
        logger.error('❌ Error fetching simulation data:', error);
        toast.error('เกิดข้อผิดพลาดในการดึงข้อมูล');
        return;
      }

      if (!queues || queues.length === 0) {
        toast.warning('ไม่มีข้อมูลจำลองให้ดาวน์โหลด');
        return;
      }

      // Convert to CSV format
      const csvData = queues.map(queue => {
        const waitTime = queue.called_at && queue.created_at 
          ? Math.round((new Date(queue.called_at).getTime() - new Date(queue.created_at).getTime()) / 60000)
          : null;
        
        const serviceTime = queue.completed_at && queue.called_at
          ? Math.round((new Date(queue.completed_at).getTime() - new Date(queue.called_at).getTime()) / 60000)
          : null;

        return {
          'Queue ID': queue.id,
          'Queue Number': queue.number,
          'Patient Name': queue.patients?.name || 'Unknown',
          'Patient ID': queue.patients?.patient_id || '',
          'Phone': queue.patients?.phone || '',
          'Queue Type': queue.type,
          'Status': queue.status,
          'Service Point': queue.service_points?.name || 'Unassigned',
          'Created At': queue.created_at,
          'Called At': queue.called_at || '',
          'Completed At': queue.completed_at || '',
          'Wait Time (minutes)': waitTime || '',
          'Service Time (minutes)': serviceTime || '',
          'Notes': queue.notes || ''
        };
      });

      // Create CSV content
      const headers = Object.keys(csvData[0]);
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => 
          headers.map(header => {
            const value = row[header as keyof typeof row];
            // Escape commas and quotes in CSV
            return typeof value === 'string' && (value.includes(',') || value.includes('"'))
              ? `"${value.replace(/"/g, '""')}"`
              : value;
          }).join(',')
        )
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `simulation-data-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      logger.info(`✅ Successfully exported ${queues.length} simulation records to CSV`);
      toast.success(`ดาวน์โหลดข้อมูลจำลอง ${queues.length} รายการเรียบร้อย`);
      
    } catch (error) {
      logger.error('❌ Error exporting CSV:', error);
      toast.error('เกิดข้อผิดพลาดในการดาวน์โหลดข้อมูล');
    }
  }, []);

  return {
    exportSimulationData
  };
};