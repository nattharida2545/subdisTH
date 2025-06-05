
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { LineSettings } from './types';
import { SendHorizontal } from 'lucide-react';

interface LineMessageTemplatesProps {
  lineSettings: LineSettings;
  isEditing: boolean;
  handleChange: (field: keyof LineSettings, value: string) => void;
  handleTestMessage?: (messageType: 'welcome' | 'queueReceived' | 'queueCalled') => void;
  isTesting?: boolean;
}

const LineMessageTemplates: React.FC<LineMessageTemplatesProps> = ({
  lineSettings,
  isEditing,
  handleChange,
  handleTestMessage,
  isTesting = false
}) => {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border p-4">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium">ข้อความต้อนรับ</h4>
          {/* Commented out test message button as requested
          {!isEditing && handleTestMessage && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => handleTestMessage('welcome')}
              disabled={isTesting}
              className="text-xs"
            >
              <SendHorizontal className="h-3 w-3 mr-1" />
              ทดสอบส่ง
            </Button>
          )}
          */}
        </div>
        <Textarea 
          value={lineSettings.welcomeMessage} 
          onChange={(e) => handleChange('welcomeMessage', e.target.value)}
          className="resize-none"
          disabled={!isEditing}
        />
      </div>
      
      <div className="rounded-lg border p-4">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium">ข้อความเมื่อรับคิว</h4>
          {/* Commented out test message button as requested
          {!isEditing && handleTestMessage && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => handleTestMessage('queueReceived')}
              disabled={isTesting}
              className="text-xs"
            >
              <SendHorizontal className="h-3 w-3 mr-1" />
              ทดสอบส่ง
            </Button>
          )}
          */}
        </div>
        <Textarea 
          value={lineSettings.queueReceivedMessage} 
          onChange={(e) => handleChange('queueReceivedMessage', e.target.value)}
          className="resize-none"
          disabled={!isEditing}
        />
        <div className="text-xs text-gray-500 mt-1">
          ตัวแปรที่รองรับ: {'{queueNumber}'}, {'{queueType}'}, {'{estimatedWaitTime}'}
        </div>
      </div>
      
      <div className="rounded-lg border p-4">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium">ข้อความเมื่อเรียกคิว</h4>
          {/* Commented out test message button as requested
          {!isEditing && handleTestMessage && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => handleTestMessage('queueCalled')}
              disabled={isTesting}
              className="text-xs"
            >
              <SendHorizontal className="h-3 w-3 mr-1" />
              ทดสอบส่ง
            </Button>
          )}
          */}
        </div>
        <Textarea 
          value={lineSettings.queueCalledMessage} 
          onChange={(e) => handleChange('queueCalledMessage', e.target.value)}
          className="resize-none" 
          disabled={!isEditing}
        />
        <div className="text-xs text-gray-500 mt-1">
          ตัวแปรที่รองรับ: {'{patientName}'}, {'{counter}'}, {'{queueNumber}'}
        </div>
      </div>
    </div>
  );
};

export default LineMessageTemplates;
