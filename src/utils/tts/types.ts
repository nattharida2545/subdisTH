
export interface TextToSpeechOptions {
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  language?: string;
  debug?: boolean;
}

// Default options optimized for Thai language
export const defaultTTSOptions: TextToSpeechOptions = {
  voice: 'th',
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
  language: 'th',
  debug: false
};
