
import { useLineSettingsState } from './useLineSettingsState';
import { useLineSettingsValidation } from './useLineSettingsValidation';
import { useLineSettingsActions } from './useLineSettingsActions';
import { useState, useEffect, useMemo } from 'react'; 

export const useLineSettings = () => {
  // All state declarations first, before any other hooks
  const [initialized, setInitialized] = useState(false);
  
  // Use useMemo for the state management to ensure consistent hook ordering
  const stateManagement = useLineSettingsState();
  
  const {
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
    handleTtsConfigChange
  } = stateManagement;

  // Get validation functionality - order is important
  const {
    errors,
    validation,
    validateSettings,
    setErrors
  } = useLineSettingsValidation(lineSettings, isEditing);

  // Get action functionality - must come after validation
  const {
    handleEdit,
    handleSave,
    handleCancel,
    handleTestConnection,
    handleTestMessage
  } = useLineSettingsActions(
    lineSettings,
    ttsConfig,
    setIsEditing,
    setIsTesting,
    setIsTestingMessage,
    setLineSettings,
    setTtsConfig,
    validateSettings,
    setErrors
  );

  // Effects always after all other hook calls
  useEffect(() => {
    if (!initialized) {
      setInitialized(true);
    }
  }, [initialized]);

  // Use useMemo for the return object to ensure stability
  return useMemo(() => ({
    // State
    isEditing,
    isTesting,
    isTestingMessage,
    lineSettings,
    ttsConfig,
    errors,
    validation,
    // Handlers
    handleEdit,
    handleSave,
    handleCancel,
    handleTestConnection,
    handleTestMessage,
    handleChange,
    handleTtsConfigChange,
  }), [
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
  ]);
};
