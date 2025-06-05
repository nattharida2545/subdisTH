
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LineCredentialFields from './line/LineCredentialFields';
import LineActionButtons from './line/LineActionButtons';
import LineOfficialAccountIcon from './line/LineOfficialAccountIcon';
import { useLineSettings } from './line/hooks/useLineSettings';
import { useLineSettingsData } from '@/hooks/useLineSettingsData';
import LineMessageTemplates from './line/LineMessageTemplates';

const LineSettings = () => {
  // First fetch the data
  const { 
    lineSettings: savedLineSettings, 
    ttsConfig: savedTtsConfig, 
    loading
  } = useLineSettingsData();

  // Then use the settings hook - must come after data fetching
  const lineSettingsHook = useLineSettings();
  
  // Destructure values from the hook with useMemo to ensure stability
  const {
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
  } = lineSettingsHook;

  // Separate loading state handling from main rendering logic
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-gray-300 border-t-pharmacy-600 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูลการตั้งค่า LINE...</p>
        </div>
      </div>
    );
  }

  // Default settings if not available
  const currentLineSettings = lineSettings || {
    channelId: "1234567890",
    channelSecret: "abcdefghijklmnopqrstuvwxyz",
    accessToken: "12345678901234567890123456789012345678901234567890",
    welcomeMessage: "ยินดีต้อนรับสู่ระบบคิวห้องยา โรงพยาบาลชุมชนตัวอย่าง",
    queueReceivedMessage: "คุณได้รับคิวหมายเลข {queueNumber} ประเภท: {queueType}\nระยะเวลารอโดยประมาณ: {estimatedWaitTime} นาที",
    queueCalledMessage: "เรียนคุณ {patientName}\nถึงคิวของคุณแล้ว! กรุณามาที่ช่องบริการ {counter}\nหมายเลขคิวของคุณคือ: {queueNumber}"
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle>LINE Official Account</CardTitle>
            <CardDescription>
              ตั้งค่าการเชื่อมต่อกับ LINE Official Account เพื่อการแจ้งเตือนผู้ป่วย
            </CardDescription>
          </div>
          <LineOfficialAccountIcon />
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <LineCredentialFields 
            lineSettings={currentLineSettings}
            isEditing={isEditing}
            handleChange={handleChange}
            errors={errors}
          />
          
          {/* <LineMessageTemplates
            lineSettings={currentLineSettings}
            isEditing={isEditing}
            handleChange={handleChange}
            handleTestMessage={handleTestMessage}
            isTesting={isTestingMessage}
          /> */}
          
          <LineActionButtons 
            isEditing={isEditing}
            isTesting={isTesting}
            handleEdit={handleEdit}
            handleSave={handleSave}
            handleCancel={handleCancel}
            handleTestConnection={handleTestConnection}
            isFormValid={validation.isFormValid}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default LineSettings;
