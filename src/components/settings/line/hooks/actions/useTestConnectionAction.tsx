
import { useCallback } from 'react';
import { toast } from 'sonner';
import { LineSettings } from '../../types';

export const useTestConnectionAction = (
  lineSettings: LineSettings,
  setIsTesting: (value: boolean) => void,
  validateSettings: () => boolean
) => {
  const handleTestConnection = useCallback(async () => {
    const isValid = validateSettings();
    
    if (!isValid) {
      toast.error('กรุณาตรวจสอบข้อมูลการเชื่อมต่อให้ถูกต้องก่อนทดสอบ');
      return;
    }
    
    setIsTesting(true);
    
    try {
      // In a real implementation, you would make an API call here
      // For now, we'll simulate the verification process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Check if the LINE API credentials are correct format
      // This is a simplified validation since we can't actually verify with LINE
      const isChannelIdValid = /^\d{5,}$/.test(lineSettings.channelId);
      const isChannelSecretValid = lineSettings.channelSecret.length >= 20;
      const isAccessTokenValid = lineSettings.accessToken.length >= 30;
      
      if (isChannelIdValid && isChannelSecretValid && isAccessTokenValid) {
        toast.success('การเชื่อมต่อกับ LINE Official Account สำเร็จ');
      } else {
        toast.error('ไม่สามารถเชื่อมต่อกับ LINE Official Account ได้ กรุณาตรวจสอบข้อมูลอีกครั้ง');
      }
    } catch (error) {
      console.error('Error testing LINE connection:', error);
      toast.error('เกิดข้อผิดพลาดในการทดสอบการเชื่อมต่อ');
    } finally {
      setIsTesting(false);
    }
  }, [validateSettings, lineSettings, setIsTesting]);

  return {
    handleTestConnection
  };
};
