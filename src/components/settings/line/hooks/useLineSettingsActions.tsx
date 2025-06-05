
import { useCallback, useMemo } from 'react';
import { useEditSaveActions } from './actions/useEditSaveActions';
import { useTestConnectionAction } from './actions/useTestConnectionAction';
import { useTestMessageAction } from './actions/useTestMessageAction';
import { LineSettings, TextToSpeechConfig } from '../types';

export const useLineSettingsActions = (
  lineSettings: LineSettings,
  ttsConfig: TextToSpeechConfig,
  setIsEditing: (value: boolean) => void,
  setIsTesting: (value: boolean) => void,
  setIsTestingMessage: (value: boolean) => void,
  setLineSettings: (value: LineSettings | ((prev: LineSettings) => LineSettings)) => void,
  setTtsConfig: (value: TextToSpeechConfig | ((prev: TextToSpeechConfig) => TextToSpeechConfig)) => void,
  validateSettings: () => boolean,
  setErrors: (errors: any) => void
) => {
  // Fetch all action handlers from the individual hook files
  const { handleEdit, handleSave, handleCancel } = useEditSaveActions(
    lineSettings,
    ttsConfig,
    setIsEditing,
    setLineSettings,
    setTtsConfig,
    validateSettings,
    setErrors
  );

  const { handleTestConnection } = useTestConnectionAction(
    lineSettings,
    setIsTesting,
    validateSettings
  );

  const { handleTestMessage } = useTestMessageAction(
    lineSettings,
    setIsTestingMessage
  );

  // Return a stable object with all actions using useMemo instead of useCallback
  return useMemo(() => ({
    handleEdit,
    handleSave,
    handleCancel,
    handleTestConnection,
    handleTestMessage
  }), [handleEdit, handleSave, handleCancel, handleTestConnection, handleTestMessage]);
};
