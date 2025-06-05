
import { useCallback } from 'react';
import { toast } from 'sonner';
import { LineSettings } from '../../types';

export const useTestMessageAction = (
  lineSettings: LineSettings,
  setIsTestingMessage: (value: boolean) => void
) => {
  const handleTestMessage = useCallback(async (messageType: 'welcome' | 'queueReceived' | 'queueCalled') => {
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
        default:
          sampleMessage = "ไม่พบข้อความตัวอย่าง";
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
  }, [lineSettings, setIsTestingMessage]);

  return {
    handleTestMessage
  };
};
