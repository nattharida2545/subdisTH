
import { useState, useEffect, useCallback, useMemo } from 'react';
import { LineSettings, TextToSpeechConfig } from '../types';

export const useLineSettingsState = () => {
  // Define default values
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

  // State declarations - these must all be at the top level of the hook
  const [isEditing, setIsEditing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isTestingMessage, setIsTestingMessage] = useState(false);
  const [lineSettings, setLineSettings] = useState<LineSettings>(defaultSettings);
  const [ttsConfig, setTtsConfig] = useState<TextToSpeechConfig>(defaultTtsConfig);

  // Field change handlers - defined using useCallback after all state declarations
  const handleChange = useCallback((field: keyof LineSettings, value: string) => {
    setLineSettings(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleTtsConfigChange = useCallback((field: keyof TextToSpeechConfig, value: any) => {
    setTtsConfig(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Load saved settings on mount - effects after callbacks
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

  // Return a stable object using useMemo
  return useMemo(() => ({
    defaultSettings,
    defaultTtsConfig,
    isEditing,
    setIsEditing,
    isTesting,
    setIsTesting,
    isTestingMessage,
    setIsTestingMessage,
    lineSettings,
    setLineSettings,
    ttsConfig,
    setTtsConfig,
    handleChange,
    handleTtsConfigChange,
  }), [
    isEditing,
    isTesting,
    isTestingMessage,
    lineSettings,
    ttsConfig,
    handleChange,
    handleTtsConfigChange
  ]);
};
