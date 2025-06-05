
import { toast } from 'sonner';
import { TextToSpeechOptions } from './types';
import { getTtsUrl } from './urlProvider';

let audioElement: HTMLAudioElement | null = null;
let isSpeaking = false;
let audioChunks: string[] = [];
let currentAudioIndex = 0;

/**
 * Stop any currently playing speech
 */
export function stopSpeaking(): void {
  isSpeaking = false;
  
  // Stop current audio
  if (audioElement) {
    audioElement.pause();
    audioElement = null;
  }
  
  // Reset variables
  currentAudioIndex = 0;
  audioChunks = [];
}

/**
 * Play the next chunk of audio
 */
export function playNextChunk(options: TextToSpeechOptions, resolve: () => void, reject: (error: Error) => void): void {
  if (!isSpeaking || currentAudioIndex >= audioChunks.length) {
    // All chunks finished or stopped
    isSpeaking = false;
    
    // Reset for next play
    currentAudioIndex = 0;
    audioChunks = [];
    
    resolve();
    return;
  }
  
  const text = audioChunks[currentAudioIndex];
  
  // Get language and voice modifiers
  let lang = options.language || 'th';
  let speechRate = options.rate || 1.0;
  
  // Handle voice modifiers if using the voice ID format
  const voice = options.voice || 'th';
  if (voice.includes('+')) {
    // Handle special voices with modifiers
    const parts = voice.split('+');
    lang = parts[0];
    
    // Apply voice modifiers
    if (parts[1] === 's') speechRate = 0.7; // Slow voice
  } else {
    // Standard voice - just use the voice ID as language
    lang = voice;
  }
  
  try {
    // Create audio element
    const audio = new Audio();
    
    // Set main event handlers
    audio.onended = () => {
      if (!isSpeaking) return;
      currentAudioIndex++;
      playNextChunk(options, resolve, reject);
    };
    
    audio.onerror = async (e) => {
      // Show error toast
      toast.error(`เกิดข้อผิดพลาดในการอ่านข้อความส่วนที่ ${currentAudioIndex+1}`);
      
      // Continue to next chunk
      if (!isSpeaking) return;
      currentAudioIndex++;
      setTimeout(() => playNextChunk(options, resolve, reject), 500);
    };
    
    // Get the TTS URL
    const url = getTtsUrl(text, lang);
    
    // Set volume
    audio.volume = options.volume || 1.0;
    
    // Try to set playback rate
    try {
      audio.playbackRate = speechRate;
    } catch (e) {
      // Browser doesn't support playbackRate adjustment
    }
    
    // Set source
    audio.src = url;
    
    // Store reference
    audioElement = audio;
    
    // Play audio
    audio.play().catch(error => {
      if (error.name === "NotAllowedError") {
        toast.error("ไม่สามารถเล่นเสียงได้: ต้องมีการโต้ตอบจากผู้ใช้ก่อน (กดปุ่มใดก็ได้)");
      }
      
      if (!isSpeaking) return;
      
      // Try next chunk
      currentAudioIndex++;
      setTimeout(() => playNextChunk(options, resolve, reject), 500);
    });
  } catch (error) {
    toast.error(`เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    if (!isSpeaking) return;
    
    // Try next chunk
    currentAudioIndex++;
    setTimeout(() => playNextChunk(options, resolve, reject), 500);
  }
}

/**
 * Initialize the audio manager with chunks
 */
export function initializeAudioChunks(chunks: string[]): void {
  audioChunks = chunks;
  currentAudioIndex = 0;
  isSpeaking = true;
}

/**
 * Cancel any ongoing speech
 */
export const cancelSpeech = (): void => {
  stopSpeaking();
};
