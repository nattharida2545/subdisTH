
import * as React from 'react';
import { toast } from 'sonner';
import { useOfflineStatus } from './useOfflineStatus';

type StorageType = 'localStorage' | 'sessionStorage';

interface SyncOptions<T> {
  onSync?: (data: T) => Promise<void>;
  storageType?: StorageType;
  syncInterval?: number;
  showToasts?: boolean;
}

/**
 * Hook for handling offline data syncing
 * It stores data locally when offline and syncs when online
 */
export function useSyncedStorage<T>(
  key: string,
  initialValue: T,
  options: SyncOptions<T> = {}
) {
  const {
    onSync,
    storageType = 'localStorage',
    syncInterval = 30000, // 30 seconds
    showToasts = true
  } = options;
  
  const storage = window[storageType];
  const isOffline = useOfflineStatus();
  const [value, setValue] = React.useState<T>(() => {
    try {
      const item = storage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from storage:', error);
      return initialValue;
    }
  });
  
  const [pendingSync, setPendingSync] = React.useState<boolean>(false);
  
  // Save to storage whenever value changes
  React.useEffect(() => {
    try {
      storage.setItem(key, JSON.stringify(value));
      
      if (isOffline && value !== initialValue) {
        setPendingSync(true);
      }
    } catch (error) {
      console.error('Error writing to storage:', error);
    }
  }, [key, value, storage, isOffline, initialValue]);
  
  // Sync with server when coming back online
  React.useEffect(() => {
    if (!isOffline && pendingSync && onSync) {
      const syncData = async () => {
        try {
          await onSync(value);
          setPendingSync(false);
          if (showToasts) {
            toast.success('ข้อมูลถูกซิงค์กับเซิร์ฟเวอร์เรียบร้อยแล้ว');
          }
        } catch (error) {
          console.error('Error syncing data:', error);
          if (showToasts) {
            toast.error('ไม่สามารถซิงค์ข้อมูลกับเซิร์ฟเวอร์ได้');
          }
        }
      };
      
      syncData();
    }
  }, [isOffline, pendingSync, onSync, value, showToasts]);
  
  // Setup periodic sync attempts when offline
  React.useEffect(() => {
    if (onSync && pendingSync) {
      const interval = setInterval(() => {
        if (!isOffline) {
          onSync(value)
            .then(() => {
              setPendingSync(false);
              if (showToasts) {
                toast.success('ข้อมูลถูกซิงค์กับเซิร์ฟเวอร์เรียบร้อยแล้ว');
              }
            })
            .catch((error) => {
              console.error('Error in periodic sync:', error);
            });
        }
      }, syncInterval);
      
      return () => clearInterval(interval);
    }
    
    return undefined;
  }, [onSync, pendingSync, value, syncInterval, isOffline, showToasts]);
  
  return [value, setValue, pendingSync] as const;
}
