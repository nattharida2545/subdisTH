
import { toast } from 'sonner';
import { TextToSpeechOptions, defaultTTSOptions } from './tts/types';
import { splitTextIntoChunks } from './tts/textProcessing';
import { stopSpeaking, playNextChunk, initializeAudioChunks, cancelSpeech } from './tts/audioManager';
import { createQueueAnnouncementMessage } from './tts/announcements';

/**
 * Speak text using Google Translate TTS
 */
export const speakText = (text: string, options: TextToSpeechOptions = {}): Promise<void> => {
  console.log("Speaking text:", text.substring(0, 50) + "...");
  
  // Check if debug mode is enabled in localStorage
  const isDebug = localStorage.getItem('tts_debug_mode') === 'true' || options.debug === true;
  
  return new Promise((resolve, reject) => {
    // Stop any current speech
    stopSpeaking();
    
    // Apply options with defaults
    const mergedOptions = { ...defaultTTSOptions, ...options, debug: isDebug };
    
    // Split text into chunks (Google Translate TTS has a character limit)
    const chunks = splitTextIntoChunks(text);
    initializeAudioChunks(chunks);
    
    // Start playing chunks
    playNextChunk(mergedOptions, resolve, reject);
  });
};

// Function to announce queue number with proper service point information
export function announceQueue(
  queueNumber: number, 
  servicePointInfo: { code?: string; name?: string } | string, 
  queueType?: string
): void {
  try {
    // Create the announcement message
    const message = createQueueAnnouncementMessage(queueNumber, servicePointInfo, queueType);
    
    console.log('Announcing queue:', {
      originalNumber: queueNumber,
      queueType,
      servicePointInfo,
      fullMessage: message
    });
    
    // Get settings from localStorage
    const volumeStr = localStorage.getItem('queue_voice_volume');
    const rateStr = localStorage.getItem('queue_voice_rate');
    const voiceType = localStorage.getItem('queue_voice_type') || 'th';
    const debugMode = localStorage.getItem('tts_debug_mode') === 'true';
    
    // Convert settings to proper values
    const volume = volumeStr ? parseInt(volumeStr) / 100 : 1; 
    const rate = rateStr ? parseInt(rateStr) / 100 : 1.0;
    
    speakText(message, { volume, rate, voice: voiceType, debug: debugMode });
  } catch (error) {
    console.error('Error announcing queue:', error);
    // Fallback to simple announcement (also removed "เชิญครับ")
    speakText(`ขอเชิญหมายเลข ${queueNumber}`);
  }
}

// Function to announce custom message
export function announceCustomMessage(message: string): void {
  const volumeStr = localStorage.getItem('queue_voice_volume');
  const rateStr = localStorage.getItem('queue_voice_rate');
  const voiceType = localStorage.getItem('queue_voice_type') || 'th';
  
  const volume = volumeStr ? parseInt(volumeStr) / 100 : 1; 
  const rate = rateStr ? parseInt(rateStr) / 100 : 1.0;
  
  speakText(message, { volume, rate, voice: voiceType });
}

// Function to test TTS with a sample message
export function testTTS(): void {
  const testMessage = 'ขอเชิญหมายเลข เอ หนึ่ง ศูนย์ ห้า';
  console.log('Testing TTS with message:', testMessage);
  
  const volumeStr = localStorage.getItem('queue_voice_volume');
  const rateStr = localStorage.getItem('queue_voice_rate');
  const voiceType = localStorage.getItem('queue_voice_type') || 'th';
  
  const volume = volumeStr ? parseInt(volumeStr) / 100 : 1; 
  const rate = rateStr ? parseInt(rateStr) / 100 : 1.0;
  
  speakText(testMessage, { volume, rate, voice: voiceType, debug: true });
}

// Re-export the cancelSpeech function
export { cancelSpeech };
