
import { toast } from 'sonner';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useQueueValidation');

export const useQueueValidation = () => {
  const validateQueueData = (patients: any[], queueTypes: any[], servicePoints: any[]) => {
    // Validate required data
    if (!patients || patients.length === 0) {
      toast.error('ไม่พบข้อมูลผู้ป่วยสำหรับการสร้างคิว');
      logger.error('No patients available for queue creation');
      return { isValid: false, enabledQueueTypes: [], enabledServicePoints: [] };
    }

    if (!queueTypes || queueTypes.length === 0) {
      toast.error('ไม่พบประเภทคิวสำหรับการสร้างคิว');
      logger.error('No queue types available for queue creation');
      return { isValid: false, enabledQueueTypes: [], enabledServicePoints: [] };
    }

    // Filter only enabled queue types
    const enabledQueueTypes = queueTypes.filter(qt => qt.enabled);
    if (enabledQueueTypes.length === 0) {
      toast.error('ไม่พบประเภทคิวที่เปิดใช้งานสำหรับการสร้างคิว');
      logger.error('No enabled queue types available');
      return { isValid: false, enabledQueueTypes: [], enabledServicePoints: [] };
    }

    // Filter enabled service points
    const enabledServicePoints = servicePoints.filter(sp => sp.enabled);
    if (enabledServicePoints.length === 0) {
      toast.error('ไม่พบจุดบริการที่เปิดใช้งานสำหรับการสร้างคิว');
      logger.error('No enabled service points available');
      return { isValid: false, enabledQueueTypes: [], enabledServicePoints: [] };
    }

    logger.info(`Using ${enabledQueueTypes.length} enabled queue types:`, enabledQueueTypes.map(qt => qt.code));
    logger.info(`Using ${enabledServicePoints.length} enabled service points:`, enabledServicePoints.map(sp => sp.code));

    return { isValid: true, enabledQueueTypes, enabledServicePoints };
  };

  return { validateQueueData };
};
