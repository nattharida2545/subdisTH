
// Simple client-side encryption for sensitive data (not for production passwords)
// This is for settings data that needs basic protection

export class ClientEncryption {
  private static encoder = new TextEncoder();
  private static decoder = new TextDecoder();

  // Generate a key from password (simplified for client-side use)
  private static async generateKey(password: string): Promise<CryptoKey> {
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      this.encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: this.encoder.encode('queue-system-salt'), // In production, use random salt
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  static async encrypt(text: string, password: string): Promise<string> {
    try {
      const key = await this.generateKey(password);
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encodedText = this.encoder.encode(text);

      const ciphertext = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv,
        },
        key,
        encodedText
      );

      // Combine IV and ciphertext
      const combined = new Uint8Array(iv.length + ciphertext.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(ciphertext), iv.length);

      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      console.error('Encryption error:', error);
      return text; // Fallback to unencrypted
    }
  }

  static async decrypt(encryptedText: string, password: string): Promise<string> {
    try {
      const key = await this.generateKey(password);
      const combined = new Uint8Array(
        atob(encryptedText)
          .split('')
          .map(char => char.charCodeAt(0))
      );

      const iv = combined.slice(0, 12);
      const ciphertext = combined.slice(12);

      const decrypted = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv,
        },
        key,
        ciphertext
      );

      return this.decoder.decode(decrypted);
    } catch (error) {
      console.error('Decryption error:', error);
      return encryptedText; // Fallback to encrypted text
    }
  }
}
