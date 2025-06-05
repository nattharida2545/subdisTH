
import { useCallback } from 'react';
import { toast } from 'sonner';
import { LineSettings, TextToSpeechConfig } from '../../types';

export const useEditSaveActions = (
  lineSettings: LineSettings,
  ttsConfig: TextToSpeechConfig,
  setIsEditing: (value: boolean) => void,
  setLineSettings: (value: LineSettings | ((prev: LineSettings) => LineSettings)) => void,
  setTtsConfig: (value: TextToSpeechConfig | ((prev: TextToSpeechConfig) => TextToSpeechConfig)) => void,
  validateSettings: () => boolean,
  setErrors: (errors: any) => void
) => {
  const handleEdit = useCallback(() => {
    setIsEditing(true);
    // Reset errors when entering edit mode
    setErrors({});
  }, [setIsEditing, setErrors]);

  const handleSave = useCallback(() => {
    const isValid = validateSettings();
    
    if (!isValid) {
      toast.error('กรุณาตรวจสอบข้อมูลที่กรอกให้ถูกต้อง');
      return;
    }
    
    setIsEditing(false);
    // Save settings to localStorage for persistence
    localStorage.setItem('lineSettings', JSON.stringify(lineSettings));
    localStorage.setItem('ttsConfig', JSON.stringify(ttsConfig));
    toast.success('บันทึกการตั้งค่า LINE Official Account เรียบร้อยแล้ว');
  }, [validateSettings, lineSettings, ttsConfig, setIsEditing]);

  const handleCancel = useCallback(() => {
    // Restore previous settings
    const savedSettings = localStorage.getItem('lineSettings');
    if (savedSettings) {
      setLineSettings(JSON.parse(savedSettings));
    }
    
    const savedTtsConfig = localStorage.getItem('ttsConfig');
    if (savedTtsConfig) {
      setTtsConfig(JSON.parse(savedTtsConfig));
    }
    
    setIsEditing(false);
    // Clear any errors
    setErrors({});
  }, [setIsEditing, setLineSettings, setTtsConfig, setErrors]);

  return {
    handleEdit,
    handleSave,
    handleCancel
  };
};
