
/**
 * Get the correct URL for TTS
 */
export function getTtsUrl(text: string, lang: string): string {
  // Check if we're in development or production
  const isDev = process.env.NODE_ENV === 'development' || 
                window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1';
  
  if (isDev) {
    // In development, use Google's TTS directly (works fine locally)
    return `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob`;
  } else {
    // In production (Netlify), use our serverless function proxy
    return `/.netlify/functions/tts-proxy?text=${encodeURIComponent(text)}&lang=${lang}`;
  }
}
