/**
 * Split text into chunks of maximum 200 characters
 */
export function splitTextIntoChunks(text: string, maxLength = 200): string[] {
  // Split by sentence endings first to try to keep sentences together
  const sentences = text.split(/(?<=[.!?।॥])\s+/);
  const chunks: string[] = [];
  let currentChunk = "";
  
  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    
    if (sentence.length > maxLength) {
      // If a single sentence is longer than maxLength, split it further
      // Try to split by commas or other natural pauses
      const parts = sentence.split(/(?<=[,;:])(?=\s)/);
      for (const part of parts) {
        if (part.length > maxLength) {
          // If still too long, just split by maxLength
          for (let j = 0; j < part.length; j += maxLength) {
            chunks.push(part.substring(j, j + maxLength));
          }
        } else {
          if (currentChunk.length + part.length > maxLength) {
            chunks.push(currentChunk);
            currentChunk = part;
          } else {
            currentChunk += (currentChunk ? " " : "") + part;
          }
        }
      }
    } else {
      // If adding this sentence would exceed maxLength, start a new chunk
      if (currentChunk.length + sentence.length > maxLength) {
        chunks.push(currentChunk);
        currentChunk = sentence;
      } else {
        currentChunk += (currentChunk ? " " : "") + sentence;
      }
    }
  }
  
  // Add the last chunk if there's anything left
  if (currentChunk) {
    chunks.push(currentChunk);
  }
  
  return chunks;
}
