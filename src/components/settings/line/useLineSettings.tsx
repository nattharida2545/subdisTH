
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { LineSettings, LineSettingsValidation, LineSettingsErrors, LineTestMessageResult, TextToSpeechConfig } from './types';

export const useLineSettings = () => {
  const defaultSettings: LineSettings = {
    channelId: "1234567890",
    channelSecret: "abcdefghijklmnopqrstuvwxyz",
    accessToken: "12345678901234567890123456789012345678901234567890",
    welcomeMessage: "ยินดีต้อนรับสู่ระบบคิวห้องยา โรงพยาบาลชุมชนตัวอย่าง",
    queueReceivedMessage: "คุณได้รับคิวหมายเลข {queueNumber} ประเภท: {queueType}\nระยะเวลารอโดยประมาณ: {estimatedWaitTime} นาที",
    queueCalledMessage: "เรียนคุณ {patientName}\nถึงคิวของคุณแล้ว! กรุณามาที่ช่องบริการ {counter}\nหมายเลขคิวของคุณคือ: {queueNumber}"
  };

  const defaultTtsConfig: TextToSpeechConfig = {
    enabled: true,
    volume: 1.0,
    rate: 1.0,
    language: 'th-TH'
  };

  const [isEditing, setIsEditing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isTestingMessage, setIsTestingMessage] = useState(false);
  const [lineSettings, setLineSettings] = useState<LineSettings>(defaultSettings);
  const [ttsConfig, setTtsConfig] = useState<TextToSpeechConfig>(defaultTtsConfig);
  const [errors, setErrors] = useState<LineSettingsErrors>({});
  const [validation, setValidation] = useState<LineSettingsValidation>({
    channelId: true,
    channelSecret: true,
    accessToken: true,
    isFormValid: true
  });

  // Load saved settings when component mounts
  useEffect(() => {
    const savedSettings = localStorage.getItem('lineSettings');
    if (savedSettings) {
      try {
        setLineSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error parsing saved LINE settings:', error);
      }
    }

    const savedTtsConfig = localStorage.getItem('ttsConfig');
    if (savedTtsConfig) {
      try {
        setTtsConfig(JSON.parse(savedTtsConfig));
      } catch (error) {
        console.error('Error parsing saved TTS config:', error);
      }
    }
  }, []);

  // Validate settings whenever they change during editing
  useEffect(() => {
    if (isEditing) {
      validateSettings();
    }
  }, [lineSettings, isEditing]);

  const validateSettings = () => {
    const newErrors: LineSettingsErrors = {};
    let newValidation = {
      channelId: true,
      channelSecret: true,
      accessToken: true,
      isFormValid: true
    };

    // Channel ID validation - should be numeric and at least 5 characters
    if (!/^\d{5,}$/.test(lineSettings.channelId)) {
      newErrors.channelId = 'Channel ID ต้องเป็นตัวเลขและมีความยาวอย่างน้อย 5 หลัก';
      newValidation.channelId = false;
      newValidation.isFormValid = false;
    }

    // Channel Secret validation - should be at least 20 characters
    if (lineSettings.channelSecret.length < 20) {
      newErrors.channelSecret = 'Channel Secret ต้องมีความยาวอย่างน้อย 20 ตัวอักษร';
      newValidation.channelSecret = false;
      newValidation.isFormValid = false;
    }

    // Access Token validation - should be at least 30 characters
    if (lineSettings.accessToken.length < 30) {
      newErrors.accessToken = 'Access Token ต้องมีความยาวอย่างน้อย 30 ตัวอักษร';
      newValidation.accessToken = false;
      newValidation.isFormValid = false;
    }

    setErrors(newErrors);
    setValidation(newValidation);
    
    return newValidation.isFormValid;
  };

  const handleEdit = () => {
    setIsEditing(true);
    // Reset errors when entering edit mode
    setErrors({});
  };

  const handleSave = () => {
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
  };

  const handleCancel = () => {
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
  };

  const handleTestConnection = async () => {
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
  };

  const handleTestMessage = async (messageType: 'welcome' | 'queueReceived' | 'queueCalled') => {
    setIsTestingMessage(true);
    
    try {
      // In a real implementation, you would make an API call to LINE Messaging API
      // For now, we'll simulate the message sending process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let messageText: string;
      let sampleMessage: string;
      
      switch (messageType) {
        case 'welcome':
          messageText = lineSettings.welcomeMessage;
          sampleMessage = messageText;
          break;
        case 'queueReceived':
          messageText = lineSettings.queueReceivedMessage
            .replace('{queueNumber}', 'A001')
            .replace('{queueType}', 'ทั่วไป')
            .replace('{estimatedWaitTime}', '15');
          sampleMessage = "ตัวอย่างข้อความ: " + messageText;
          break;
        case 'queueCalled':
          messageText = lineSettings.queueCalledMessage
            .replace('{patientName}', 'คุณสมชาย')
            .replace('{counter}', '2')
            .replace('{queueNumber}', 'A001');
          sampleMessage = "ตัวอย่างข้อความ: " + messageText;
          break;
      }
      
      toast.success(`ส่งข้อความทดสอบสำเร็จ\n${sampleMessage}`, {
        duration: 4000
      });
      
    } catch (error) {
      console.error('Error sending test message:', error);
      toast.error('เกิดข้อผิดพลาดในการส่งข้อความทดสอบ');
    } finally {
      setIsTestingMessage(false);
    }
  };

  const handleChange = (field: keyof LineSettings, value: string) => {
    setLineSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTtsConfigChange = (field: keyof TextToSpeechConfig, value: any) => {
    setTtsConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return {
    isEditing,
    isTesting,
    isTestingMessage,
    lineSettings,
    ttsConfig,
    errors,
    validation,
    handleEdit,
    handleSave,
    handleCancel,
    handleTestConnection,
    handleTestMessage,
    handleChange,
    handleTtsConfigChange,
  };
};
