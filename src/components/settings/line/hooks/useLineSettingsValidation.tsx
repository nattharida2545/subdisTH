
import { useState, useEffect, useCallback, useMemo } from 'react';
import { LineSettings, LineSettingsValidation, LineSettingsErrors } from '../types';

export const useLineSettingsValidation = (
  lineSettings: LineSettings,
  isEditing: boolean
) => {
  // State hooks - must be at the top level
  const [errors, setErrors] = useState<LineSettingsErrors>({});
  const [validation, setValidation] = useState<LineSettingsValidation>({
    channelId: true,
    channelSecret: true,
    accessToken: true,
    loginChannelId: true,
    loginChannelSecret: true,
    isFormValid: true
  });

  // Validation function - defined using useCallback
  const validateSettings = useCallback(() => {
    const newErrors: LineSettingsErrors = {};
    let newValidation = {
      channelId: true,
      channelSecret: true,
      accessToken: true,
      loginChannelId: true,
      loginChannelSecret: true,
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

    // Login Channel ID validation (optional)
    if (lineSettings.loginChannelId && !/^\d{5,}$/.test(lineSettings.loginChannelId)) {
      newErrors.loginChannelId = 'Login Channel ID ต้องเป็นตัวเลขและมีความยาวอย่างน้อย 5 หลัก';
      newValidation.loginChannelId = false;
      newValidation.isFormValid = false;
    }

    // Login Channel Secret validation (optional)
    if (lineSettings.loginChannelSecret && lineSettings.loginChannelSecret.length < 20) {
      newErrors.loginChannelSecret = 'Login Channel Secret ต้องมีความยาวอย่างน้อย 20 ตัวอักษร';
      newValidation.loginChannelSecret = false;
      newValidation.isFormValid = false;
    }

    setErrors(newErrors);
    setValidation(newValidation);
    
    return newValidation.isFormValid;
  }, [lineSettings]);

  // Effects come after all declarations
  useEffect(() => {
    if (isEditing) {
      validateSettings();
    }
  }, [lineSettings, isEditing, validateSettings]);

  // Return a stable object using useMemo
  return useMemo(() => ({
    errors,
    validation,
    validateSettings,
    setErrors
  }), [errors, validation, validateSettings]);
};
