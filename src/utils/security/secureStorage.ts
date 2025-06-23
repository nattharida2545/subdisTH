
import { ClientEncryption } from './encryption';

class SecureStorage {
  private static encryptionKey = 'queue-system-storage-key';

  // Secure storage for sensitive data
  static async setSecure(key: string, value: any): Promise<void> {
    try {
      const stringValue = JSON.stringify(value);
      const encrypted = await ClientEncryption.encrypt(stringValue, this.encryptionKey);
      localStorage.setItem(`secure_${key}`, encrypted);
    } catch (error) {
      console.error('Error storing secure data:', error);
      // Fallback to regular storage for non-critical data
      localStorage.setItem(key, JSON.stringify(value));
    }
  }

  // Retrieve secure data
  static async getSecure(key: string): Promise<any> {
    try {
      const encrypted = localStorage.getItem(`secure_${key}`);
      if (!encrypted) return null;
      
      const decrypted = await ClientEncryption.decrypt(encrypted, this.encryptionKey);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Error retrieving secure data:', error);
      // Fallback to regular storage
      const fallback = localStorage.getItem(key);
      return fallback ? JSON.parse(fallback) : null;
    }
  }

  // Remove secure data
  static removeSecure(key: string): void {
    localStorage.removeItem(`secure_${key}`);
    localStorage.removeItem(key); // Remove fallback too
  }

  // Clear all auth-related data
  static clearAuthData(): void {
    const keysToRemove: string[] = [];
    
    // Find all auth-related keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.startsWith('supabase.auth.') ||
        key.includes('sb-') ||
        key.startsWith('secure_') ||
        key === 'lineToken' ||
        key === 'userPhone' ||
        key === 'selectedPatientId'
      )) {
        keysToRemove.push(key);
      }
    }
    
    // Remove all found keys
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Clear sessionStorage too
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('supabase.auth.') || 
          key.includes('sb-') ||
          key.includes('PatientContext')) {
        sessionStorage.removeItem(key);
      }
    });
  }

  // Session timeout management
  static setWithExpiry(key: string, value: any, ttl: number): void {
    const now = new Date();
    const item = {
      value: value,
      expiry: now.getTime() + ttl,
    };
    localStorage.setItem(key, JSON.stringify(item));
  }

  static getWithExpiry(key: string): any {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    try {
      const item = JSON.parse(itemStr);
      const now = new Date();
      
      if (now.getTime() > item.expiry) {
        localStorage.removeItem(key);
        return null;
      }
      
      return item.value;
    } catch (error) {
      localStorage.removeItem(key);
      return null;
    }
  }
}

export default SecureStorage;
